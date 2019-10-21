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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGFyd2luLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9qb25hdGhhbnBhcmsvc3JjL2RldmNlcnQvIiwic291cmNlcyI6WyJwbGF0Zm9ybXMvZGFyd2luLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHdEQUF3QjtBQUN4QiwyQkFBNEY7QUFDNUYsMERBQWdDO0FBQ2hDLG1EQUF1RDtBQUN2RCxvQ0FBK0I7QUFFL0IscUNBQTZGO0FBRzdGLE1BQU0sS0FBSyxHQUFHLGVBQVcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBR3JEO0lBQUE7UUFFVSx3QkFBbUIsR0FBRywyQkFBMkIsQ0FBQztRQUNsRCxxQkFBZ0IsR0FBRyxjQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO1FBQ2pGLG9CQUFlLEdBQUcsY0FBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxnREFBZ0QsQ0FBQyxDQUFDO1FBRWhHLG1CQUFjLEdBQUcsWUFBWSxDQUFDO0lBd0V4QyxDQUFDO0lBdEVDOzs7Ozs7T0FNRztJQUNHLGdCQUFnQixDQUFDLGVBQXVCLEVBQUUsVUFBbUIsRUFBRTs7WUFFbkUsK0JBQStCO1lBQy9CLEtBQUssQ0FBQyxpREFBaUQsQ0FBQyxDQUFDO1lBQ3pELFdBQUcsQ0FBQyx5R0FBMEcsZUFBZ0IsR0FBRyxDQUFDLENBQUM7WUFFbkksSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsRUFBRTtnQkFDN0Isd0RBQXdEO2dCQUN4RCxLQUFLLENBQUMseUVBQXlFLENBQUMsQ0FBQztnQkFDakYsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFBRTtvQkFDMUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRTt3QkFDaEMsSUFBSSxxQkFBYSxDQUFDLE1BQU0sQ0FBQyxFQUFFOzRCQUN6QixLQUFLLENBQUMseUdBQXlHLENBQUMsQ0FBQzs0QkFDakgsV0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7eUJBQ3pCOzZCQUFNOzRCQUNMLEtBQUssQ0FBQywyR0FBMkcsQ0FBQyxDQUFDOzRCQUNuSCxPQUFPLE1BQU0saUNBQXdCLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLGVBQWUsQ0FBQyxDQUFDO3lCQUMvRTtxQkFDRjt5QkFBTTt3QkFDTCxLQUFLLENBQUMsaUhBQWlILENBQUMsQ0FBQTt3QkFDeEgsT0FBTyxNQUFNLGlDQUF3QixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxlQUFlLENBQUMsQ0FBQztxQkFDL0U7aUJBQ0Y7Z0JBQ0QsSUFBSSxZQUFZLEdBQUcsY0FBSSxDQUFDLElBQUksQ0FBQyxXQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBQzVGLE1BQU0scUJBQVksRUFBRSxDQUFDO2dCQUNyQixNQUFNLGtDQUF5QixDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsZUFBZSxFQUFFLFlBQVksQ0FBQyxDQUFDO2FBQ3RGO2lCQUFNO2dCQUNMLEtBQUssQ0FBQyw2RUFBNkUsQ0FBQyxDQUFDO2FBQ3RGO1FBQ0gsQ0FBQztLQUFBO0lBRUssNEJBQTRCLENBQUMsTUFBYzs7WUFDL0MsSUFBSSxpQkFBaUIsR0FBRyxpQkFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDMUQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDdkMsV0FBRyxDQUFDLHFCQUFzQixNQUFPLG9CQUFxQixJQUFJLENBQUMsY0FBZSxlQUFlLENBQUMsQ0FBQzthQUM1RjtRQUNILENBQUM7S0FBQTtJQUVLLGlCQUFpQixDQUFDLFFBQWdCOztZQUN0QyxPQUFPLENBQUMsTUFBTSxXQUFHLENBQUMsYUFBYSxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDakUsQ0FBQztLQUFBO0lBRUssa0JBQWtCLENBQUMsUUFBZ0IsRUFBRSxRQUFnQjs7WUFDekQsSUFBSSxlQUFNLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ3BCLE1BQU0sV0FBRyxDQUFDLFlBQVksUUFBUSxHQUFHLENBQUMsQ0FBQzthQUNwQztZQUNELGtCQUFTLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzlCLE1BQU0sV0FBRyxDQUFDLGlCQUFpQixRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBQ3hDLE1BQU0sV0FBRyxDQUFDLG1CQUFtQixRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQzVDLENBQUM7S0FBQTtJQUVPLGtCQUFrQjtRQUN4QixPQUFPLGVBQU0sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRU8sY0FBYztRQUNwQixJQUFJO1lBQ0YsT0FBTyxXQUFHLENBQUMsY0FBYyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQzNEO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDVixPQUFPLEtBQUssQ0FBQztTQUNkO0lBQ0gsQ0FBQztDQUVGO0FBOUVELGdDQThFQztBQUFBLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IHdyaXRlRmlsZVN5bmMgYXMgd3JpdGVGaWxlLCBleGlzdHNTeW5jIGFzIGV4aXN0cywgcmVhZEZpbGVTeW5jIGFzIHJlYWQgfSBmcm9tICdmcyc7XG5pbXBvcnQgY3JlYXRlRGVidWcgZnJvbSAnZGVidWcnO1xuaW1wb3J0IHsgc3luYyBhcyBjb21tYW5kRXhpc3RzIH0gZnJvbSAnY29tbWFuZC1leGlzdHMnO1xuaW1wb3J0IHsgcnVuIH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHsgT3B0aW9ucyB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IGFkZENlcnRpZmljYXRlVG9OU1NDZXJ0REIsIG9wZW5DZXJ0aWZpY2F0ZUluRmlyZWZveCwgY2xvc2VGaXJlZm94IH0gZnJvbSAnLi9zaGFyZWQnO1xuaW1wb3J0IHsgUGxhdGZvcm0gfSBmcm9tICcuJztcblxuY29uc3QgZGVidWcgPSBjcmVhdGVEZWJ1ZygnZGV2Y2VydDpwbGF0Zm9ybXM6bWFjb3MnKTtcblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYWNPU1BsYXRmb3JtIGltcGxlbWVudHMgUGxhdGZvcm0ge1xuXG4gIHByaXZhdGUgRklSRUZPWF9CVU5ETEVfUEFUSCA9ICcvQXBwbGljYXRpb25zL0ZpcmVmb3guYXBwJztcbiAgcHJpdmF0ZSBGSVJFRk9YX0JJTl9QQVRIID0gcGF0aC5qb2luKHRoaXMuRklSRUZPWF9CVU5ETEVfUEFUSCwgJ0NvbnRlbnRzL01hY09TL2ZpcmVmb3gnKTtcbiAgcHJpdmF0ZSBGSVJFRk9YX05TU19ESVIgPSBwYXRoLmpvaW4ocHJvY2Vzcy5lbnYuSE9NRSwgJ0xpYnJhcnkvQXBwbGljYXRpb24gU3VwcG9ydC9GaXJlZm94L1Byb2ZpbGVzLyonKTtcblxuICBwcml2YXRlIEhPU1RfRklMRV9QQVRIID0gJy9ldGMvaG9zdHMnO1xuXG4gIC8qKlxuICAgKiBtYWNPUyBpcyBwcmV0dHkgc2ltcGxlIC0ganVzdCBhZGQgdGhlIGNlcnRpZmljYXRlIHRvIHRoZSBzeXN0ZW0ga2V5Y2hhaW4sXG4gICAqIGFuZCBtb3N0IGFwcGxpY2F0aW9ucyB3aWxsIGRlbGVnYXRlIHRvIHRoYXQgZm9yIGRldGVybWluaW5nIHRydXN0ZWRcbiAgICogY2VydGlmaWNhdGVzLiBGaXJlZm94LCBvZiBjb3Vyc2UsIGRvZXMgaXQncyBvd24gdGhpbmcuIFdlIGNhbiB0cnkgdG9cbiAgICogYXV0b21hdGljYWxseSBpbnN0YWxsIHRoZSBjZXJ0IHdpdGggRmlyZWZveCBpZiB3ZSBjYW4gdXNlIGNlcnR1dGlsIHZpYSB0aGVcbiAgICogYG5zc2AgSG9tZWJyZXcgcGFja2FnZSwgb3RoZXJ3aXNlIHdlIGdvIG1hbnVhbCB3aXRoIHVzZXItZmFjaW5nIHByb21wdHMuXG4gICAqL1xuICBhc3luYyBhZGRUb1RydXN0U3RvcmVzKGNlcnRpZmljYXRlUGF0aDogc3RyaW5nLCBvcHRpb25zOiBPcHRpb25zID0ge30pOiBQcm9taXNlPHZvaWQ+IHtcblxuICAgIC8vIENocm9tZSwgU2FmYXJpLCBzeXN0ZW0gdXRpbHNcbiAgICBkZWJ1ZygnQWRkaW5nIGRldmNlcnQgcm9vdCBDQSB0byBtYWNPUyBzeXN0ZW0ga2V5Y2hhaW4nKTtcbiAgICBydW4oYHN1ZG8gc2VjdXJpdHkgYWRkLXRydXN0ZWQtY2VydCAtZCAtciB0cnVzdFJvb3QgLWsgL0xpYnJhcnkvS2V5Y2hhaW5zL1N5c3RlbS5rZXljaGFpbiAtcCBzc2wgLXAgYmFzaWMgXCIkeyBjZXJ0aWZpY2F0ZVBhdGggfVwiYCk7XG5cbiAgICBpZiAodGhpcy5pc0ZpcmVmb3hJbnN0YWxsZWQoKSkge1xuICAgICAgLy8gVHJ5IHRvIHVzZSBjZXJ0dXRpbCB0byBpbnN0YWxsIHRoZSBjZXJ0IGF1dG9tYXRpY2FsbHlcbiAgICAgIGRlYnVnKCdGaXJlZm94IGluc3RhbGwgZGV0ZWN0ZWQuIEFkZGluZyBkZXZjZXJ0IHJvb3QgQ0EgdG8gRmlyZWZveCB0cnVzdCBzdG9yZScpO1xuICAgICAgaWYgKCF0aGlzLmlzTlNTSW5zdGFsbGVkKCkpIHtcbiAgICAgICAgaWYgKCFvcHRpb25zLnNraXBDZXJ0dXRpbEluc3RhbGwpIHtcbiAgICAgICAgICBpZiAoY29tbWFuZEV4aXN0cygnYnJldycpKSB7XG4gICAgICAgICAgICBkZWJ1ZyhgY2VydHV0aWwgaXMgbm90IGFscmVhZHkgaW5zdGFsbGVkLCBidXQgSG9tZWJyZXcgaXMgZGV0ZWN0ZWQuIFRyeWluZyB0byBpbnN0YWxsIGNlcnR1dGlsIHZpYSBIb21lYnJldy4uLmApO1xuICAgICAgICAgICAgcnVuKCdicmV3IGluc3RhbGwgbnNzJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlYnVnKGBIb21lYnJldyBpc24ndCBpbnN0YWxsZWQsIHNvIHdlIGNhbid0IHRyeSB0byBpbnN0YWxsIGNlcnR1dGlsLiBGYWxsaW5nIGJhY2sgdG8gbWFudWFsIGNlcnRpZmljYXRlIGluc3RhbGxgKTtcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCBvcGVuQ2VydGlmaWNhdGVJbkZpcmVmb3godGhpcy5GSVJFRk9YX0JJTl9QQVRILCBjZXJ0aWZpY2F0ZVBhdGgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWJ1ZyhgY2VydHV0aWwgaXMgbm90IGFscmVhZHkgaW5zdGFsbGVkLCBhbmQgc2tpcENlcnR1dGlsSW5zdGFsbCBpcyB0cnVlLCBzbyB3ZSBoYXZlIHRvIGZhbGwgYmFjayB0byBhIG1hbnVhbCBpbnN0YWxsYClcbiAgICAgICAgICByZXR1cm4gYXdhaXQgb3BlbkNlcnRpZmljYXRlSW5GaXJlZm94KHRoaXMuRklSRUZPWF9CSU5fUEFUSCwgY2VydGlmaWNhdGVQYXRoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGV0IGNlcnR1dGlsUGF0aCA9IHBhdGguam9pbihydW4oJ2JyZXcgLS1wcmVmaXggbnNzJykudG9TdHJpbmcoKS50cmltKCksICdiaW4nLCAnY2VydHV0aWwnKTtcbiAgICAgIGF3YWl0IGNsb3NlRmlyZWZveCgpO1xuICAgICAgYXdhaXQgYWRkQ2VydGlmaWNhdGVUb05TU0NlcnREQih0aGlzLkZJUkVGT1hfTlNTX0RJUiwgY2VydGlmaWNhdGVQYXRoLCBjZXJ0dXRpbFBhdGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWJ1ZygnRmlyZWZveCBkb2VzIG5vdCBhcHBlYXIgdG8gYmUgaW5zdGFsbGVkLCBza2lwcGluZyBGaXJlZm94LXNwZWNpZmljIHN0ZXBzLi4uJyk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgYWRkRG9tYWluVG9Ib3N0RmlsZUlmTWlzc2luZyhkb21haW46IHN0cmluZykge1xuICAgIGxldCBob3N0c0ZpbGVDb250ZW50cyA9IHJlYWQodGhpcy5IT1NUX0ZJTEVfUEFUSCwgJ3V0ZjgnKTtcbiAgICBpZiAoIWhvc3RzRmlsZUNvbnRlbnRzLmluY2x1ZGVzKGRvbWFpbikpIHtcbiAgICAgIHJ1bihgZWNobyAnXFxuMTI3LjAuMC4xICR7IGRvbWFpbiB9JyB8IHN1ZG8gdGVlIC1hIFwiJHsgdGhpcy5IT1NUX0ZJTEVfUEFUSCB9XCIgPiAvZGV2L251bGxgKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyByZWFkUHJvdGVjdGVkRmlsZShmaWxlcGF0aDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIChhd2FpdCBydW4oYHN1ZG8gY2F0IFwiJHtmaWxlcGF0aH1cImApKS50b1N0cmluZygpLnRyaW0oKTtcbiAgfVxuXG4gIGFzeW5jIHdyaXRlUHJvdGVjdGVkRmlsZShmaWxlcGF0aDogc3RyaW5nLCBjb250ZW50czogc3RyaW5nKSB7XG4gICAgaWYgKGV4aXN0cyhmaWxlcGF0aCkpIHtcbiAgICAgIGF3YWl0IHJ1bihgc3VkbyBybSBcIiR7ZmlsZXBhdGh9XCJgKTtcbiAgICB9XG4gICAgd3JpdGVGaWxlKGZpbGVwYXRoLCBjb250ZW50cyk7XG4gICAgYXdhaXQgcnVuKGBzdWRvIGNob3duIDAgXCIke2ZpbGVwYXRofVwiYCk7XG4gICAgYXdhaXQgcnVuKGBzdWRvIGNobW9kIDYwMCBcIiR7ZmlsZXBhdGh9XCJgKTtcbiAgfVxuXG4gIHByaXZhdGUgaXNGaXJlZm94SW5zdGFsbGVkKCkge1xuICAgIHJldHVybiBleGlzdHModGhpcy5GSVJFRk9YX0JVTkRMRV9QQVRIKTtcbiAgfVxuXG4gIHByaXZhdGUgaXNOU1NJbnN0YWxsZWQoKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBydW4oJ2JyZXcgbGlzdCAtMScpLnRvU3RyaW5nKCkuaW5jbHVkZXMoJ1xcbm5zc1xcbicpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxufTtcbiJdfQ==