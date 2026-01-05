"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = require("fs");
const debug_1 = tslib_1.__importDefault(require("debug"));
const command_exists_1 = require("command-exists");
const utils_1 = require("../utils");
const shared_1 = require("./shared");
const debug = debug_1.default('devcert:platforms:macos');
class MacOSPlatform {
    constructor() {
        this.FIREFOX_BUNDLE_PATH = '/Applications/Firefox.app';
        this.FIREFOX_BIN_PATH = path_1.default.join(this.FIREFOX_BUNDLE_PATH, 'Contents/MacOS/firefox');
        this.FIREFOX_NSS_DIR = path_1.default.join(process.env.HOME, 'Library/Application Support/Firefox/Profiles/*');
        this.HOST_FILE_PATH = '/etc/hosts';
    }
    /**
     * macOS is pretty simple - just add the certificate to the system keychain,
     * and most applications will delegate to that for determining trusted
     * certificates. Firefox, of course, does it's own thing. We can try to
     * automatically install the cert with Firefox if we can use certutil via the
     * `nss` Homebrew package, otherwise we go manual with user-facing prompts.
     */
    addToTrustStores(certificatePath, options = {}) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // Chrome, Safari, system utils
            debug('Adding devcert root CA to macOS system keychain');
            utils_1.run(`sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain -p ssl -p basic "${certificatePath}"`);
            if (this.isFirefoxInstalled()) {
                // Try to use certutil to install the cert automatically
                debug('Firefox install detected. Adding devcert root CA to Firefox trust store');
                if (!this.isNSSInstalled()) {
                    if (!options.skipCertutilInstall) {
                        if (command_exists_1.sync('brew')) {
                            debug(`certutil is not already installed, but Homebrew is detected. Trying to install certutil via Homebrew...`);
                            utils_1.run('brew install nss');
                        }
                        else {
                            debug(`Homebrew isn't installed, so we can't try to install certutil. Falling back to manual certificate install`);
                            return yield shared_1.openCertificateInFirefox(this.FIREFOX_BIN_PATH, certificatePath);
                        }
                    }
                    else {
                        debug(`certutil is not already installed, and skipCertutilInstall is true, so we have to fall back to a manual install`);
                        return yield shared_1.openCertificateInFirefox(this.FIREFOX_BIN_PATH, certificatePath);
                    }
                }
                let certutilPath = path_1.default.join(utils_1.run('brew --prefix nss').toString().trim(), 'bin', 'certutil');
                yield shared_1.closeFirefox();
                yield shared_1.addCertificateToNSSCertDB(this.FIREFOX_NSS_DIR, certificatePath, certutilPath);
            }
            else {
                debug('Firefox does not appear to be installed, skipping Firefox-specific steps...');
            }
        });
    }
    addDomainToHostFileIfMissing(domain) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let hostsFileContents = fs_1.readFileSync(this.HOST_FILE_PATH, 'utf8');
            if (!hostsFileContents.includes(domain)) {
                utils_1.run(`echo '\n127.0.0.1 ${domain}' | sudo tee -a "${this.HOST_FILE_PATH}" > /dev/null`);
            }
        });
    }
    readProtectedFile(filepath) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return (yield utils_1.run(`sudo cat "${filepath}"`)).toString().trim();
        });
    }
    writeProtectedFile(filepath, contents) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (fs_1.existsSync(filepath)) {
                yield utils_1.run(`sudo rm "${filepath}"`);
            }
            fs_1.writeFileSync(filepath, contents);
            yield utils_1.run(`sudo chown 0 "${filepath}"`);
            yield utils_1.run(`sudo chmod 600 "${filepath}"`);
        });
    }
    isFirefoxInstalled() {
        return fs_1.existsSync(this.FIREFOX_BUNDLE_PATH);
    }
    isNSSInstalled() {
        try {
            return utils_1.run('brew list -1').toString().includes('\nnss\n');
        }
        catch (e) {
            return false;
        }
    }
}
exports.default = MacOSPlatform;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGFyd2luLmpzIiwic291cmNlUm9vdCI6Ii9wcml2YXRlL3RtcC9kZXZjZXJ0LWZpeC8iLCJzb3VyY2VzIjpbInBsYXRmb3Jtcy9kYXJ3aW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsd0RBQXdCO0FBQ3hCLDJCQUE0RjtBQUM1RiwwREFBZ0M7QUFDaEMsbURBQXVEO0FBQ3ZELG9DQUErQjtBQUUvQixxQ0FBNkY7QUFHN0YsTUFBTSxLQUFLLEdBQUcsZUFBVyxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFHckQ7SUFBQTtRQUVVLHdCQUFtQixHQUFHLDJCQUEyQixDQUFDO1FBQ2xELHFCQUFnQixHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLHdCQUF3QixDQUFDLENBQUM7UUFDakYsb0JBQWUsR0FBRyxjQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLGdEQUFnRCxDQUFDLENBQUM7UUFFaEcsbUJBQWMsR0FBRyxZQUFZLENBQUM7SUF3RXhDLENBQUM7SUF0RUM7Ozs7OztPQU1HO0lBQ0csZ0JBQWdCLENBQUMsZUFBdUIsRUFBRSxVQUFtQixFQUFFOztZQUVuRSwrQkFBK0I7WUFDL0IsS0FBSyxDQUFDLGlEQUFpRCxDQUFDLENBQUM7WUFDekQsV0FBRyxDQUFDLHlHQUEwRyxlQUFnQixHQUFHLENBQUMsQ0FBQztZQUVuSSxJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxFQUFFO2dCQUM3Qix3REFBd0Q7Z0JBQ3hELEtBQUssQ0FBQyx5RUFBeUUsQ0FBQyxDQUFDO2dCQUNqRixJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxFQUFFO29CQUMxQixJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixFQUFFO3dCQUNoQyxJQUFJLHFCQUFhLENBQUMsTUFBTSxDQUFDLEVBQUU7NEJBQ3pCLEtBQUssQ0FBQyx5R0FBeUcsQ0FBQyxDQUFDOzRCQUNqSCxXQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQzt5QkFDekI7NkJBQU07NEJBQ0wsS0FBSyxDQUFDLDJHQUEyRyxDQUFDLENBQUM7NEJBQ25ILE9BQU8sTUFBTSxpQ0FBd0IsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsZUFBZSxDQUFDLENBQUM7eUJBQy9FO3FCQUNGO3lCQUFNO3dCQUNMLEtBQUssQ0FBQyxpSEFBaUgsQ0FBQyxDQUFBO3dCQUN4SCxPQUFPLE1BQU0saUNBQXdCLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLGVBQWUsQ0FBQyxDQUFDO3FCQUMvRTtpQkFDRjtnQkFDRCxJQUFJLFlBQVksR0FBRyxjQUFJLENBQUMsSUFBSSxDQUFDLFdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDNUYsTUFBTSxxQkFBWSxFQUFFLENBQUM7Z0JBQ3JCLE1BQU0sa0NBQXlCLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxlQUFlLEVBQUUsWUFBWSxDQUFDLENBQUM7YUFDdEY7aUJBQU07Z0JBQ0wsS0FBSyxDQUFDLDZFQUE2RSxDQUFDLENBQUM7YUFDdEY7UUFDSCxDQUFDO0tBQUE7SUFFSyw0QkFBNEIsQ0FBQyxNQUFjOztZQUMvQyxJQUFJLGlCQUFpQixHQUFHLGlCQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMxRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUN2QyxXQUFHLENBQUMscUJBQXNCLE1BQU8sb0JBQXFCLElBQUksQ0FBQyxjQUFlLGVBQWUsQ0FBQyxDQUFDO2FBQzVGO1FBQ0gsQ0FBQztLQUFBO0lBRUssaUJBQWlCLENBQUMsUUFBZ0I7O1lBQ3RDLE9BQU8sQ0FBQyxNQUFNLFdBQUcsQ0FBQyxhQUFhLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNqRSxDQUFDO0tBQUE7SUFFSyxrQkFBa0IsQ0FBQyxRQUFnQixFQUFFLFFBQWdCOztZQUN6RCxJQUFJLGVBQU0sQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDcEIsTUFBTSxXQUFHLENBQUMsWUFBWSxRQUFRLEdBQUcsQ0FBQyxDQUFDO2FBQ3BDO1lBQ0Qsa0JBQVMsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDOUIsTUFBTSxXQUFHLENBQUMsaUJBQWlCLFFBQVEsR0FBRyxDQUFDLENBQUM7WUFDeEMsTUFBTSxXQUFHLENBQUMsbUJBQW1CLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDNUMsQ0FBQztLQUFBO0lBRU8sa0JBQWtCO1FBQ3hCLE9BQU8sZUFBTSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFTyxjQUFjO1FBQ3BCLElBQUk7WUFDRixPQUFPLFdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDM0Q7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7SUFDSCxDQUFDO0NBRUY7QUE5RUQsZ0NBOEVDO0FBQUEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgd3JpdGVGaWxlU3luYyBhcyB3cml0ZUZpbGUsIGV4aXN0c1N5bmMgYXMgZXhpc3RzLCByZWFkRmlsZVN5bmMgYXMgcmVhZCB9IGZyb20gJ2ZzJztcbmltcG9ydCBjcmVhdGVEZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5pbXBvcnQgeyBzeW5jIGFzIGNvbW1hbmRFeGlzdHMgfSBmcm9tICdjb21tYW5kLWV4aXN0cyc7XG5pbXBvcnQgeyBydW4gfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgeyBPcHRpb25zIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgYWRkQ2VydGlmaWNhdGVUb05TU0NlcnREQiwgb3BlbkNlcnRpZmljYXRlSW5GaXJlZm94LCBjbG9zZUZpcmVmb3ggfSBmcm9tICcuL3NoYXJlZCc7XG5pbXBvcnQgeyBQbGF0Zm9ybSB9IGZyb20gJy4nO1xuXG5jb25zdCBkZWJ1ZyA9IGNyZWF0ZURlYnVnKCdkZXZjZXJ0OnBsYXRmb3JtczptYWNvcycpO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1hY09TUGxhdGZvcm0gaW1wbGVtZW50cyBQbGF0Zm9ybSB7XG5cbiAgcHJpdmF0ZSBGSVJFRk9YX0JVTkRMRV9QQVRIID0gJy9BcHBsaWNhdGlvbnMvRmlyZWZveC5hcHAnO1xuICBwcml2YXRlIEZJUkVGT1hfQklOX1BBVEggPSBwYXRoLmpvaW4odGhpcy5GSVJFRk9YX0JVTkRMRV9QQVRILCAnQ29udGVudHMvTWFjT1MvZmlyZWZveCcpO1xuICBwcml2YXRlIEZJUkVGT1hfTlNTX0RJUiA9IHBhdGguam9pbihwcm9jZXNzLmVudi5IT01FLCAnTGlicmFyeS9BcHBsaWNhdGlvbiBTdXBwb3J0L0ZpcmVmb3gvUHJvZmlsZXMvKicpO1xuXG4gIHByaXZhdGUgSE9TVF9GSUxFX1BBVEggPSAnL2V0Yy9ob3N0cyc7XG5cbiAgLyoqXG4gICAqIG1hY09TIGlzIHByZXR0eSBzaW1wbGUgLSBqdXN0IGFkZCB0aGUgY2VydGlmaWNhdGUgdG8gdGhlIHN5c3RlbSBrZXljaGFpbixcbiAgICogYW5kIG1vc3QgYXBwbGljYXRpb25zIHdpbGwgZGVsZWdhdGUgdG8gdGhhdCBmb3IgZGV0ZXJtaW5pbmcgdHJ1c3RlZFxuICAgKiBjZXJ0aWZpY2F0ZXMuIEZpcmVmb3gsIG9mIGNvdXJzZSwgZG9lcyBpdCdzIG93biB0aGluZy4gV2UgY2FuIHRyeSB0b1xuICAgKiBhdXRvbWF0aWNhbGx5IGluc3RhbGwgdGhlIGNlcnQgd2l0aCBGaXJlZm94IGlmIHdlIGNhbiB1c2UgY2VydHV0aWwgdmlhIHRoZVxuICAgKiBgbnNzYCBIb21lYnJldyBwYWNrYWdlLCBvdGhlcndpc2Ugd2UgZ28gbWFudWFsIHdpdGggdXNlci1mYWNpbmcgcHJvbXB0cy5cbiAgICovXG4gIGFzeW5jIGFkZFRvVHJ1c3RTdG9yZXMoY2VydGlmaWNhdGVQYXRoOiBzdHJpbmcsIG9wdGlvbnM6IE9wdGlvbnMgPSB7fSk6IFByb21pc2U8dm9pZD4ge1xuXG4gICAgLy8gQ2hyb21lLCBTYWZhcmksIHN5c3RlbSB1dGlsc1xuICAgIGRlYnVnKCdBZGRpbmcgZGV2Y2VydCByb290IENBIHRvIG1hY09TIHN5c3RlbSBrZXljaGFpbicpO1xuICAgIHJ1bihgc3VkbyBzZWN1cml0eSBhZGQtdHJ1c3RlZC1jZXJ0IC1kIC1yIHRydXN0Um9vdCAtayAvTGlicmFyeS9LZXljaGFpbnMvU3lzdGVtLmtleWNoYWluIC1wIHNzbCAtcCBiYXNpYyBcIiR7IGNlcnRpZmljYXRlUGF0aCB9XCJgKTtcblxuICAgIGlmICh0aGlzLmlzRmlyZWZveEluc3RhbGxlZCgpKSB7XG4gICAgICAvLyBUcnkgdG8gdXNlIGNlcnR1dGlsIHRvIGluc3RhbGwgdGhlIGNlcnQgYXV0b21hdGljYWxseVxuICAgICAgZGVidWcoJ0ZpcmVmb3ggaW5zdGFsbCBkZXRlY3RlZC4gQWRkaW5nIGRldmNlcnQgcm9vdCBDQSB0byBGaXJlZm94IHRydXN0IHN0b3JlJyk7XG4gICAgICBpZiAoIXRoaXMuaXNOU1NJbnN0YWxsZWQoKSkge1xuICAgICAgICBpZiAoIW9wdGlvbnMuc2tpcENlcnR1dGlsSW5zdGFsbCkge1xuICAgICAgICAgIGlmIChjb21tYW5kRXhpc3RzKCdicmV3JykpIHtcbiAgICAgICAgICAgIGRlYnVnKGBjZXJ0dXRpbCBpcyBub3QgYWxyZWFkeSBpbnN0YWxsZWQsIGJ1dCBIb21lYnJldyBpcyBkZXRlY3RlZC4gVHJ5aW5nIHRvIGluc3RhbGwgY2VydHV0aWwgdmlhIEhvbWVicmV3Li4uYCk7XG4gICAgICAgICAgICBydW4oJ2JyZXcgaW5zdGFsbCBuc3MnKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVidWcoYEhvbWVicmV3IGlzbid0IGluc3RhbGxlZCwgc28gd2UgY2FuJ3QgdHJ5IHRvIGluc3RhbGwgY2VydHV0aWwuIEZhbGxpbmcgYmFjayB0byBtYW51YWwgY2VydGlmaWNhdGUgaW5zdGFsbGApO1xuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IG9wZW5DZXJ0aWZpY2F0ZUluRmlyZWZveCh0aGlzLkZJUkVGT1hfQklOX1BBVEgsIGNlcnRpZmljYXRlUGF0aCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlYnVnKGBjZXJ0dXRpbCBpcyBub3QgYWxyZWFkeSBpbnN0YWxsZWQsIGFuZCBza2lwQ2VydHV0aWxJbnN0YWxsIGlzIHRydWUsIHNvIHdlIGhhdmUgdG8gZmFsbCBiYWNrIHRvIGEgbWFudWFsIGluc3RhbGxgKVxuICAgICAgICAgIHJldHVybiBhd2FpdCBvcGVuQ2VydGlmaWNhdGVJbkZpcmVmb3godGhpcy5GSVJFRk9YX0JJTl9QQVRILCBjZXJ0aWZpY2F0ZVBhdGgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBsZXQgY2VydHV0aWxQYXRoID0gcGF0aC5qb2luKHJ1bignYnJldyAtLXByZWZpeCBuc3MnKS50b1N0cmluZygpLnRyaW0oKSwgJ2JpbicsICdjZXJ0dXRpbCcpO1xuICAgICAgYXdhaXQgY2xvc2VGaXJlZm94KCk7XG4gICAgICBhd2FpdCBhZGRDZXJ0aWZpY2F0ZVRvTlNTQ2VydERCKHRoaXMuRklSRUZPWF9OU1NfRElSLCBjZXJ0aWZpY2F0ZVBhdGgsIGNlcnR1dGlsUGF0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnKCdGaXJlZm94IGRvZXMgbm90IGFwcGVhciB0byBiZSBpbnN0YWxsZWQsIHNraXBwaW5nIEZpcmVmb3gtc3BlY2lmaWMgc3RlcHMuLi4nKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBhZGREb21haW5Ub0hvc3RGaWxlSWZNaXNzaW5nKGRvbWFpbjogc3RyaW5nKSB7XG4gICAgbGV0IGhvc3RzRmlsZUNvbnRlbnRzID0gcmVhZCh0aGlzLkhPU1RfRklMRV9QQVRILCAndXRmOCcpO1xuICAgIGlmICghaG9zdHNGaWxlQ29udGVudHMuaW5jbHVkZXMoZG9tYWluKSkge1xuICAgICAgcnVuKGBlY2hvICdcXG4xMjcuMC4wLjEgJHsgZG9tYWluIH0nIHwgc3VkbyB0ZWUgLWEgXCIkeyB0aGlzLkhPU1RfRklMRV9QQVRIIH1cIiA+IC9kZXYvbnVsbGApO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHJlYWRQcm90ZWN0ZWRGaWxlKGZpbGVwYXRoOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gKGF3YWl0IHJ1bihgc3VkbyBjYXQgXCIke2ZpbGVwYXRofVwiYCkpLnRvU3RyaW5nKCkudHJpbSgpO1xuICB9XG5cbiAgYXN5bmMgd3JpdGVQcm90ZWN0ZWRGaWxlKGZpbGVwYXRoOiBzdHJpbmcsIGNvbnRlbnRzOiBzdHJpbmcpIHtcbiAgICBpZiAoZXhpc3RzKGZpbGVwYXRoKSkge1xuICAgICAgYXdhaXQgcnVuKGBzdWRvIHJtIFwiJHtmaWxlcGF0aH1cImApO1xuICAgIH1cbiAgICB3cml0ZUZpbGUoZmlsZXBhdGgsIGNvbnRlbnRzKTtcbiAgICBhd2FpdCBydW4oYHN1ZG8gY2hvd24gMCBcIiR7ZmlsZXBhdGh9XCJgKTtcbiAgICBhd2FpdCBydW4oYHN1ZG8gY2htb2QgNjAwIFwiJHtmaWxlcGF0aH1cImApO1xuICB9XG5cbiAgcHJpdmF0ZSBpc0ZpcmVmb3hJbnN0YWxsZWQoKSB7XG4gICAgcmV0dXJuIGV4aXN0cyh0aGlzLkZJUkVGT1hfQlVORExFX1BBVEgpO1xuICB9XG5cbiAgcHJpdmF0ZSBpc05TU0luc3RhbGxlZCgpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHJ1bignYnJldyBsaXN0IC0xJykudG9TdHJpbmcoKS5pbmNsdWRlcygnXFxubnNzXFxuJyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG59O1xuIl19