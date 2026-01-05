"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_1 = require("fs");
const debug_1 = tslib_1.__importDefault(require("debug"));
const command_exists_1 = require("command-exists");
const rimraf_1 = tslib_1.__importDefault(require("rimraf"));
const constants_1 = require("./constants");
const platforms_1 = tslib_1.__importDefault(require("./platforms"));
const certificate_authority_1 = tslib_1.__importDefault(require("./certificate-authority"));
const certificates_1 = tslib_1.__importDefault(require("./certificates"));
const user_interface_1 = tslib_1.__importDefault(require("./user-interface"));
const debug = debug_1.default('devcert');
/**
 * Request an SSL certificate for the given app name signed by the devcert root
 * certificate authority. If devcert has previously generated a certificate for
 * that app name on this machine, it will reuse that certificate.
 *
 * If this is the first time devcert is being run on this machine, it will
 * generate and attempt to install a root certificate authority.
 *
 * Returns a promise that resolves with { key, cert }, where `key` and `cert`
 * are Buffers with the contents of the certificate private key and certificate
 * file, respectively
 */
function certificateFor(domain, options = {}) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        debug(`Certificate requested for ${domain}. Skipping certutil install: ${Boolean(options.skipCertutilInstall)}. Skipping hosts file: ${Boolean(options.skipHostsFile)}`);
        if (options.ui) {
            Object.assign(user_interface_1.default, options.ui);
        }
        if (!constants_1.isMac && !constants_1.isLinux && !constants_1.isWindows) {
            throw new Error(`Platform not supported: "${process.platform}"`);
        }
        if (!command_exists_1.sync('openssl')) {
            throw new Error('OpenSSL not found: OpenSSL is required to generate SSL certificates - make sure it is installed and available in your PATH');
        }
        let domainKeyPath = constants_1.pathForDomain(domain, `private-key.key`);
        let domainCertPath = constants_1.pathForDomain(domain, `certificate.crt`);
        if (process.env.REGEN_CERT) {
            try {
                fs_1.unlinkSync(constants_1.rootCAKeyPath);
            }
            catch (e) { }
            try {
                fs_1.unlinkSync(constants_1.pathForDomain(domain, `certificate.crt`));
            }
            catch (e) { }
        }
        if (!fs_1.existsSync(constants_1.rootCAKeyPath)) {
            debug('Root CA is not installed yet, so it must be our first run. Installing root CA ...');
            yield certificate_authority_1.default(options);
        }
        if (!fs_1.existsSync(constants_1.pathForDomain(domain, `certificate.crt`)) || process.env.REGEN_CERT) {
            debug(`Can't find certificate file for ${domain}, so it must be the first request for ${domain}. Generating and caching ...`);
            yield certificates_1.default(domain);
        }
        if (!options.skipHostsFile) {
            yield platforms_1.default.addDomainToHostFileIfMissing(domain);
        }
        debug(`Returning domain certificate`);
        return {
            key: fs_1.readFileSync(domainKeyPath),
            cert: fs_1.readFileSync(domainCertPath)
        };
    });
}
exports.certificateFor = certificateFor;
function hasCertificateFor(domain) {
    return fs_1.existsSync(constants_1.pathForDomain(domain, `certificate.crt`));
}
exports.hasCertificateFor = hasCertificateFor;
function configuredDomains() {
    return fs_1.readdirSync(constants_1.domainsDir);
}
exports.configuredDomains = configuredDomains;
function removeDomain(domain) {
    return rimraf_1.default.sync(constants_1.pathForDomain(domain));
}
exports.removeDomain = removeDomain;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL3ByaXZhdGUvdG1wL2RldmNlcnQtZml4LyIsInNvdXJjZXMiOlsiaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkJBQWtIO0FBQ2xILDBEQUFnQztBQUNoQyxtREFBdUQ7QUFDdkQsNERBQTRCO0FBQzVCLDJDQU9xQjtBQUNyQixvRUFBMEM7QUFDMUMsNEZBQWtFO0FBQ2xFLDBFQUF1RDtBQUN2RCw4RUFBcUQ7QUFFckQsTUFBTSxLQUFLLEdBQUcsZUFBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBUXJDOzs7Ozs7Ozs7OztHQVdHO0FBQ0gsd0JBQXFDLE1BQWMsRUFBRSxVQUFtQixFQUFFOztRQUN4RSxLQUFLLENBQUMsNkJBQThCLE1BQU8sZ0NBQWlDLE9BQU8sQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUUsMEJBQTJCLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRS9LLElBQUksT0FBTyxDQUFDLEVBQUUsRUFBRTtZQUNkLE1BQU0sQ0FBQyxNQUFNLENBQUMsd0JBQUUsRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDL0I7UUFFRCxJQUFJLENBQUMsaUJBQUssSUFBSSxDQUFDLG1CQUFPLElBQUksQ0FBQyxxQkFBUyxFQUFFO1lBQ3BDLE1BQU0sSUFBSSxLQUFLLENBQUMsNEJBQTZCLE9BQU8sQ0FBQyxRQUFTLEdBQUcsQ0FBQyxDQUFDO1NBQ3BFO1FBRUQsSUFBSSxDQUFDLHFCQUFhLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDN0IsTUFBTSxJQUFJLEtBQUssQ0FBQyw0SEFBNEgsQ0FBQyxDQUFDO1NBQy9JO1FBRUQsSUFBSSxhQUFhLEdBQUcseUJBQWEsQ0FBQyxNQUFNLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUM3RCxJQUFJLGNBQWMsR0FBRyx5QkFBYSxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBRTlELElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUU7WUFDMUIsSUFBSTtnQkFDRixlQUFNLENBQUMseUJBQWEsQ0FBQyxDQUFDO2FBQ3ZCO1lBQUMsT0FBTyxDQUFDLEVBQUMsR0FBRztZQUNkLElBQUk7Z0JBQ0YsZUFBTSxDQUFDLHlCQUFhLENBQUMsTUFBTSxFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQzthQUNsRDtZQUFDLE9BQU8sQ0FBQyxFQUFDLEdBQUc7U0FDZjtRQUVELElBQUksQ0FBQyxlQUFNLENBQUMseUJBQWEsQ0FBQyxFQUFFO1lBQzFCLEtBQUssQ0FBQyxtRkFBbUYsQ0FBQyxDQUFDO1lBQzNGLE1BQU0sK0JBQTJCLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDNUM7UUFFRCxJQUFJLENBQUMsZUFBTSxDQUFDLHlCQUFhLENBQUMsTUFBTSxFQUFFLGlCQUFpQixDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRTtZQUMvRSxLQUFLLENBQUMsbUNBQW9DLE1BQU8seUNBQTBDLE1BQU8sOEJBQThCLENBQUMsQ0FBQztZQUNsSSxNQUFNLHNCQUF5QixDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ3pDO1FBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUU7WUFDMUIsTUFBTSxtQkFBZSxDQUFDLDRCQUE0QixDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzVEO1FBRUQsS0FBSyxDQUFDLDhCQUE4QixDQUFDLENBQUM7UUFDdEMsT0FBTztZQUNMLEdBQUcsRUFBRSxpQkFBUSxDQUFDLGFBQWEsQ0FBQztZQUM1QixJQUFJLEVBQUUsaUJBQVEsQ0FBQyxjQUFjLENBQUM7U0FDL0IsQ0FBQztJQUNKLENBQUM7Q0FBQTtBQTlDRCx3Q0E4Q0M7QUFFRCwyQkFBa0MsTUFBYztJQUM5QyxPQUFPLGVBQU0sQ0FBQyx5QkFBYSxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7QUFDMUQsQ0FBQztBQUZELDhDQUVDO0FBRUQ7SUFDRSxPQUFPLGdCQUFPLENBQUMsc0JBQVUsQ0FBQyxDQUFDO0FBQzdCLENBQUM7QUFGRCw4Q0FFQztBQUVELHNCQUE2QixNQUFjO0lBQ3pDLE9BQU8sZ0JBQU0sQ0FBQyxJQUFJLENBQUMseUJBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQzVDLENBQUM7QUFGRCxvQ0FFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHJlYWRGaWxlU3luYyBhcyByZWFkRmlsZSwgcmVhZGRpclN5bmMgYXMgcmVhZGRpciwgZXhpc3RzU3luYyBhcyBleGlzdHMsIHVubGlua1N5bmMgYXMgdW5saW5rIH0gZnJvbSAnZnMnO1xuaW1wb3J0IGNyZWF0ZURlYnVnIGZyb20gJ2RlYnVnJztcbmltcG9ydCB7IHN5bmMgYXMgY29tbWFuZEV4aXN0cyB9IGZyb20gJ2NvbW1hbmQtZXhpc3RzJztcbmltcG9ydCByaW1yYWYgZnJvbSAncmltcmFmJztcbmltcG9ydCB7XG4gIGlzTWFjLFxuICBpc0xpbnV4LFxuICBpc1dpbmRvd3MsXG4gIHBhdGhGb3JEb21haW4sXG4gIGRvbWFpbnNEaXIsXG4gIHJvb3RDQUtleVBhdGhcbn0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IGN1cnJlbnRQbGF0Zm9ybSBmcm9tICcuL3BsYXRmb3Jtcyc7XG5pbXBvcnQgaW5zdGFsbENlcnRpZmljYXRlQXV0aG9yaXR5IGZyb20gJy4vY2VydGlmaWNhdGUtYXV0aG9yaXR5JztcbmltcG9ydCBnZW5lcmF0ZURvbWFpbkNlcnRpZmljYXRlIGZyb20gJy4vY2VydGlmaWNhdGVzJztcbmltcG9ydCBVSSwgeyBVc2VySW50ZXJmYWNlIH0gZnJvbSAnLi91c2VyLWludGVyZmFjZSc7XG5cbmNvbnN0IGRlYnVnID0gY3JlYXRlRGVidWcoJ2RldmNlcnQnKTtcblxuZXhwb3J0IGludGVyZmFjZSBPcHRpb25zIHtcbiAgc2tpcENlcnR1dGlsSW5zdGFsbD86IHRydWUsXG4gIHNraXBIb3N0c0ZpbGU/OiB0cnVlLFxuICB1aT86IFVzZXJJbnRlcmZhY2Vcbn1cblxuLyoqXG4gKiBSZXF1ZXN0IGFuIFNTTCBjZXJ0aWZpY2F0ZSBmb3IgdGhlIGdpdmVuIGFwcCBuYW1lIHNpZ25lZCBieSB0aGUgZGV2Y2VydCByb290XG4gKiBjZXJ0aWZpY2F0ZSBhdXRob3JpdHkuIElmIGRldmNlcnQgaGFzIHByZXZpb3VzbHkgZ2VuZXJhdGVkIGEgY2VydGlmaWNhdGUgZm9yXG4gKiB0aGF0IGFwcCBuYW1lIG9uIHRoaXMgbWFjaGluZSwgaXQgd2lsbCByZXVzZSB0aGF0IGNlcnRpZmljYXRlLlxuICpcbiAqIElmIHRoaXMgaXMgdGhlIGZpcnN0IHRpbWUgZGV2Y2VydCBpcyBiZWluZyBydW4gb24gdGhpcyBtYWNoaW5lLCBpdCB3aWxsXG4gKiBnZW5lcmF0ZSBhbmQgYXR0ZW1wdCB0byBpbnN0YWxsIGEgcm9vdCBjZXJ0aWZpY2F0ZSBhdXRob3JpdHkuXG4gKlxuICogUmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHsga2V5LCBjZXJ0IH0sIHdoZXJlIGBrZXlgIGFuZCBgY2VydGBcbiAqIGFyZSBCdWZmZXJzIHdpdGggdGhlIGNvbnRlbnRzIG9mIHRoZSBjZXJ0aWZpY2F0ZSBwcml2YXRlIGtleSBhbmQgY2VydGlmaWNhdGVcbiAqIGZpbGUsIHJlc3BlY3RpdmVseVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2VydGlmaWNhdGVGb3IoZG9tYWluOiBzdHJpbmcsIG9wdGlvbnM6IE9wdGlvbnMgPSB7fSkge1xuICBkZWJ1ZyhgQ2VydGlmaWNhdGUgcmVxdWVzdGVkIGZvciAkeyBkb21haW4gfS4gU2tpcHBpbmcgY2VydHV0aWwgaW5zdGFsbDogJHsgQm9vbGVhbihvcHRpb25zLnNraXBDZXJ0dXRpbEluc3RhbGwpIH0uIFNraXBwaW5nIGhvc3RzIGZpbGU6ICR7IEJvb2xlYW4ob3B0aW9ucy5za2lwSG9zdHNGaWxlKSB9YCk7XG5cbiAgaWYgKG9wdGlvbnMudWkpIHtcbiAgICBPYmplY3QuYXNzaWduKFVJLCBvcHRpb25zLnVpKTtcbiAgfVxuXG4gIGlmICghaXNNYWMgJiYgIWlzTGludXggJiYgIWlzV2luZG93cykge1xuICAgIHRocm93IG5ldyBFcnJvcihgUGxhdGZvcm0gbm90IHN1cHBvcnRlZDogXCIkeyBwcm9jZXNzLnBsYXRmb3JtIH1cImApO1xuICB9XG5cbiAgaWYgKCFjb21tYW5kRXhpc3RzKCdvcGVuc3NsJykpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ09wZW5TU0wgbm90IGZvdW5kOiBPcGVuU1NMIGlzIHJlcXVpcmVkIHRvIGdlbmVyYXRlIFNTTCBjZXJ0aWZpY2F0ZXMgLSBtYWtlIHN1cmUgaXQgaXMgaW5zdGFsbGVkIGFuZCBhdmFpbGFibGUgaW4geW91ciBQQVRIJyk7XG4gIH1cblxuICBsZXQgZG9tYWluS2V5UGF0aCA9IHBhdGhGb3JEb21haW4oZG9tYWluLCBgcHJpdmF0ZS1rZXkua2V5YCk7XG4gIGxldCBkb21haW5DZXJ0UGF0aCA9IHBhdGhGb3JEb21haW4oZG9tYWluLCBgY2VydGlmaWNhdGUuY3J0YCk7XG5cbiAgaWYgKHByb2Nlc3MuZW52LlJFR0VOX0NFUlQpIHtcbiAgICB0cnkge1xuICAgICAgdW5saW5rKHJvb3RDQUtleVBhdGgpO1xuICAgIH0gY2F0Y2ggKGUpeyB9XG4gICAgdHJ5IHtcbiAgICAgIHVubGluayhwYXRoRm9yRG9tYWluKGRvbWFpbiwgYGNlcnRpZmljYXRlLmNydGApKTtcbiAgICB9IGNhdGNoIChlKXsgfVxuICB9XG5cbiAgaWYgKCFleGlzdHMocm9vdENBS2V5UGF0aCkpIHtcbiAgICBkZWJ1ZygnUm9vdCBDQSBpcyBub3QgaW5zdGFsbGVkIHlldCwgc28gaXQgbXVzdCBiZSBvdXIgZmlyc3QgcnVuLiBJbnN0YWxsaW5nIHJvb3QgQ0EgLi4uJyk7XG4gICAgYXdhaXQgaW5zdGFsbENlcnRpZmljYXRlQXV0aG9yaXR5KG9wdGlvbnMpO1xuICB9XG5cbiAgaWYgKCFleGlzdHMocGF0aEZvckRvbWFpbihkb21haW4sIGBjZXJ0aWZpY2F0ZS5jcnRgKSkgfHwgcHJvY2Vzcy5lbnYuUkVHRU5fQ0VSVCkge1xuICAgIGRlYnVnKGBDYW4ndCBmaW5kIGNlcnRpZmljYXRlIGZpbGUgZm9yICR7IGRvbWFpbiB9LCBzbyBpdCBtdXN0IGJlIHRoZSBmaXJzdCByZXF1ZXN0IGZvciAkeyBkb21haW4gfS4gR2VuZXJhdGluZyBhbmQgY2FjaGluZyAuLi5gKTtcbiAgICBhd2FpdCBnZW5lcmF0ZURvbWFpbkNlcnRpZmljYXRlKGRvbWFpbik7XG4gIH1cblxuICBpZiAoIW9wdGlvbnMuc2tpcEhvc3RzRmlsZSkge1xuICAgIGF3YWl0IGN1cnJlbnRQbGF0Zm9ybS5hZGREb21haW5Ub0hvc3RGaWxlSWZNaXNzaW5nKGRvbWFpbik7XG4gIH1cblxuICBkZWJ1ZyhgUmV0dXJuaW5nIGRvbWFpbiBjZXJ0aWZpY2F0ZWApO1xuICByZXR1cm4ge1xuICAgIGtleTogcmVhZEZpbGUoZG9tYWluS2V5UGF0aCksXG4gICAgY2VydDogcmVhZEZpbGUoZG9tYWluQ2VydFBhdGgpXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNDZXJ0aWZpY2F0ZUZvcihkb21haW46IHN0cmluZykge1xuICByZXR1cm4gZXhpc3RzKHBhdGhGb3JEb21haW4oZG9tYWluLCBgY2VydGlmaWNhdGUuY3J0YCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uZmlndXJlZERvbWFpbnMoKSB7XG4gIHJldHVybiByZWFkZGlyKGRvbWFpbnNEaXIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlRG9tYWluKGRvbWFpbjogc3RyaW5nKSB7XG4gIHJldHVybiByaW1yYWYuc3luYyhwYXRoRm9yRG9tYWluKGRvbWFpbikpO1xufVxuIl19