#!/usr/bin/env python3
import argparse
import datetime
import json
import os
from pathlib import Path
import shutil
import shlex
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
PACKAGE = 'local.simplehome.firetv'
COMPONENT = PACKAGE + '/.HomeReturnService'
LONG_COMPONENT = PACKAGE + '/' + PACKAGE + '.HomeReturnService'


class Device:
    def __init__(self, serial):
        self.serial = serial
        self.adb = shutil.which('adb')
        if not self.adb:
            sdk = os.environ.get('ANDROID_HOME') or os.environ.get('ANDROID_SDK_ROOT')
            candidate = Path(sdk) / 'platform-tools' / ('adb.exe' if os.name == 'nt' else 'adb') if sdk else None
            if not candidate or not candidate.is_file():
                raise RuntimeError('Install Android platform-tools and add adb to PATH, or set ANDROID_HOME.')
            self.adb = str(candidate)

    def run(self, *arguments, check=True, binary=False, timeout=90):
        result = subprocess.run([self.adb, '-s', self.serial, *arguments], capture_output=True,
                                text=not binary, timeout=timeout)
        if check and result.returncode:
            message = result.stderr if result.stderr else result.stdout
            if binary:
                message = message.decode('utf-8', errors='replace')
            raise RuntimeError(message.strip() or 'ADB command failed.')
        return result

    def shell(self, *arguments):
        return self.run('shell', shlex.join(arguments)).stdout.strip()

    def ensure_connected(self):
        if self.run('get-state', check=False, timeout=15).stdout.strip() != 'device':
            raise RuntimeError('Device is offline or unauthorized. Connect and accept authorization on the TV first.')

    def services(self):
        raw = self.shell('settings', 'get', 'secure', 'enabled_accessibility_services')
        return [entry for entry in raw.split(':') if entry and entry != 'null']

    def package_path(self):
        result = self.run('shell', shlex.join(['pm', 'path', PACKAGE]), check=False)
        if result.returncode and (result.stdout.strip() or result.stderr.strip()):
            raise RuntimeError(result.stderr.strip() or result.stdout.strip())
        return result.stdout.strip()

    def backup(self):
        stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S.%fZ')
        folder = ROOT / 'backup' / stamp
        folder.mkdir(parents=True, exist_ok=False)
        properties = {key: self.shell('getprop', key) for key in (
            'ro.product.model', 'ro.build.version.release', 'ro.build.version.sdk', 'ro.build.display.id')}
        settings = {key: self.shell('settings', 'get', 'secure', key) for key in (
            'enabled_accessibility_services', 'accessibility_enabled')}
        (folder / 'device.json').write_text(json.dumps(properties, indent=2) + '\n', encoding='utf-8')
        (folder / 'accessibility.json').write_text(json.dumps(settings, indent=2) + '\n', encoding='utf-8')
        (folder / 'packages.txt').write_text(self.shell('pm', 'list', 'packages') + '\n', encoding='utf-8')
        (folder / 'disabled-packages.txt').write_text(self.shell('pm', 'list', 'packages', '-d') + '\n', encoding='utf-8')
        paths = self.package_path().splitlines()
        base = next((entry[8:] for entry in paths if entry.startswith('package:') and entry.endswith('/base.apk')), None)
        if base:
            self.run('pull', base, str(folder / 'previous-launcher.apk'))
        print('Local backup:', folder)
        print('This is not a private app-data backup. Do not publish it.')
        return folder

    def helper(self, enabled):
        if enabled and not self.package_path().startswith('package:'):
            raise RuntimeError('Install and open the launcher before enabling its helper.')
        self.backup()
        existing = self.services()
        remaining = [entry for entry in existing if entry not in (COMPONENT, LONG_COMPONENT)]
        old_flag = self.shell('settings', 'get', 'secure', 'accessibility_enabled')
        if enabled:
            remaining.append(COMPONENT)
        if remaining:
            self.shell('settings', 'put', 'secure', 'enabled_accessibility_services', ':'.join(remaining))
        else:
            self.shell('settings', 'delete', 'secure', 'enabled_accessibility_services')
        if enabled:
            self.shell('settings', 'put', 'secure', 'accessibility_enabled', '1')
        elif not remaining and old_flag == '1':
            self.shell('settings', 'put', 'secure', 'accessibility_enabled', '0')
        actual = self.services()
        active = any(entry in (COMPONENT, LONG_COMPONENT) for entry in actual)
        if active != enabled or any(entry not in actual for entry in existing if entry not in (COMPONENT, LONG_COMPONENT)):
            raise RuntimeError('Accessibility verification failed. Stop and inspect the local backup; do not disable other services.')
        print('Home helper enabled; test the physical remote and restart.' if enabled else 'Home helper removed. Press Home to use Amazon normally.')


def confirm(message, assume_yes):
    if not assume_yes and input(message + ' Type yes to continue: ').strip().lower() != 'yes':
        raise RuntimeError('Cancelled without changing the TV.')


def main():
    parser = argparse.ArgumentParser(description='Purify Your TV: explicit, reversible Fire TV setup tools.')
    parser.add_argument('--device', required=True, help='ADB serial, usually TV_IP:5555')
    parser.add_argument('--yes', action='store_true', help='Confirm an already-approved install/helper action noninteractively')
    commands = parser.add_subparsers(dest='command', required=True)
    for name in ('connect', 'doctor', 'backup', 'launch', 'helper-on', 'helper-off'):
        commands.add_parser(name)
    install = commands.add_parser('install')
    install.add_argument('--apk', type=Path, default=ROOT / 'launcher/build/local/PurifyYourTV-FireTV.apk')
    screenshot = commands.add_parser('screenshot')
    screenshot.add_argument('output', type=Path)
    arguments = parser.parse_args()
    if not arguments.device or any(character.isspace() for character in arguments.device) or arguments.device.startswith('-'):
        parser.error('Use a single valid ADB device serial, without whitespace.')
    device = Device(arguments.device)
    if arguments.command == 'connect':
        result = subprocess.run([device.adb, 'connect', arguments.device], capture_output=True, text=True, timeout=20)
        print(result.stdout.strip())
        if result.returncode:
            raise RuntimeError(result.stderr.strip() or 'Connection failed.')
        print('Accept the authorization prompt on your own TV, then run doctor.')
        return
    device.ensure_connected()
    if arguments.command == 'doctor':
        for key in ('ro.product.model', 'ro.build.version.release', 'ro.build.version.sdk', 'ro.build.display.id'):
            print(key + ': ' + device.shell('getprop', key))
        package = device.shell('dumpsys', 'package', PACKAGE)
        for line in package.splitlines():
            if 'versionCode=' in line or 'versionName=' in line:
                print(line.strip())
        print('App installed:', bool(device.package_path()))
        print('Helper listed:', any(entry in (COMPONENT, LONG_COMPONENT) for entry in device.services()))
        print('Physical remote and reboot behavior require a person to verify.')
    elif arguments.command == 'backup':
        device.backup()
    elif arguments.command == 'install':
        apk = arguments.apk.resolve()
        if not apk.is_file() or apk.suffix.lower() != '.apk':
            raise RuntimeError('APK not found. Build from source first, or pass --apk.')
        confirm('Install this APK in place, preserving app data? ' + str(apk), arguments.yes)
        device.backup()
        print(device.run('install', '-r', str(apk), timeout=180).stdout.strip())
        print('Installed. No Home-role change or accessibility grant was performed.')
    elif arguments.command == 'launch':
        print(device.shell('am', 'start', '-n', PACKAGE + '/.MainActivity'))
    elif arguments.command == 'screenshot':
        arguments.output.parent.mkdir(parents=True, exist_ok=True)
        image = device.run('exec-out', 'screencap', '-p', binary=True).stdout
        if not image.startswith(b'\x89PNG\r\n\x1a\n'):
            raise RuntimeError('TV did not return a PNG screenshot.')
        arguments.output.write_bytes(image)
        print('Saved. Inspect for account/device details before sharing:', arguments.output)
    elif arguments.command in ('helper-on', 'helper-off'):
        enabled = arguments.command == 'helper-on'
        confirm('Enable this app’s accessibility Home helper?' if enabled else 'Remove only this app’s accessibility Home helper?', arguments.yes)
        device.helper(enabled)


if __name__ == '__main__':
    try:
        main()
    except (RuntimeError, OSError, subprocess.SubprocessError, EOFError, KeyboardInterrupt) as error:
        print('Stopped:', str(error) or type(error).__name__, file=sys.stderr)
        sys.exit(1)
