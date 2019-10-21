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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2pvbmF0aGFucGFyay9zcmMvZGV2Y2VydC8iLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJCQUFrSDtBQUNsSCwwREFBZ0M7QUFDaEMsbURBQXVEO0FBQ3ZELDREQUE0QjtBQUM1QiwyQ0FPcUI7QUFDckIsb0VBQTBDO0FBQzFDLDRGQUFrRTtBQUNsRSwwRUFBdUQ7QUFDdkQsOEVBQXFEO0FBRXJELE1BQU0sS0FBSyxHQUFHLGVBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQVFyQzs7Ozs7Ozs7Ozs7R0FXRztBQUNILHdCQUFxQyxNQUFjLEVBQUUsVUFBbUIsRUFBRTs7UUFDeEUsS0FBSyxDQUFDLDZCQUE4QixNQUFPLGdDQUFpQyxPQUFPLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFFLDBCQUEyQixPQUFPLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBRSxFQUFFLENBQUMsQ0FBQztRQUUvSyxJQUFJLE9BQU8sQ0FBQyxFQUFFLEVBQUU7WUFDZCxNQUFNLENBQUMsTUFBTSxDQUFDLHdCQUFFLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQy9CO1FBRUQsSUFBSSxDQUFDLGlCQUFLLElBQUksQ0FBQyxtQkFBTyxJQUFJLENBQUMscUJBQVMsRUFBRTtZQUNwQyxNQUFNLElBQUksS0FBSyxDQUFDLDRCQUE2QixPQUFPLENBQUMsUUFBUyxHQUFHLENBQUMsQ0FBQztTQUNwRTtRQUVELElBQUksQ0FBQyxxQkFBYSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzdCLE1BQU0sSUFBSSxLQUFLLENBQUMsNEhBQTRILENBQUMsQ0FBQztTQUMvSTtRQUVELElBQUksYUFBYSxHQUFHLHlCQUFhLENBQUMsTUFBTSxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFDN0QsSUFBSSxjQUFjLEdBQUcseUJBQWEsQ0FBQyxNQUFNLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUU5RCxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFO1lBQzFCLElBQUk7Z0JBQ0YsZUFBTSxDQUFDLHlCQUFhLENBQUMsQ0FBQzthQUN2QjtZQUFDLE9BQU8sQ0FBQyxFQUFDLEdBQUc7WUFDZCxJQUFJO2dCQUNGLGVBQU0sQ0FBQyx5QkFBYSxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7YUFDbEQ7WUFBQyxPQUFPLENBQUMsRUFBQyxHQUFHO1NBQ2Y7UUFFRCxJQUFJLENBQUMsZUFBTSxDQUFDLHlCQUFhLENBQUMsRUFBRTtZQUMxQixLQUFLLENBQUMsbUZBQW1GLENBQUMsQ0FBQztZQUMzRixNQUFNLCtCQUEyQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQzVDO1FBRUQsSUFBSSxDQUFDLGVBQU0sQ0FBQyx5QkFBYSxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUU7WUFDL0UsS0FBSyxDQUFDLG1DQUFvQyxNQUFPLHlDQUEwQyxNQUFPLDhCQUE4QixDQUFDLENBQUM7WUFDbEksTUFBTSxzQkFBeUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUN6QztRQUVELElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFO1lBQzFCLE1BQU0sbUJBQWUsQ0FBQyw0QkFBNEIsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUM1RDtRQUVELEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO1FBQ3RDLE9BQU87WUFDTCxHQUFHLEVBQUUsaUJBQVEsQ0FBQyxhQUFhLENBQUM7WUFDNUIsSUFBSSxFQUFFLGlCQUFRLENBQUMsY0FBYyxDQUFDO1NBQy9CLENBQUM7SUFDSixDQUFDO0NBQUE7QUE5Q0Qsd0NBOENDO0FBRUQsMkJBQWtDLE1BQWM7SUFDOUMsT0FBTyxlQUFNLENBQUMseUJBQWEsQ0FBQyxNQUFNLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO0FBQzFELENBQUM7QUFGRCw4Q0FFQztBQUVEO0lBQ0UsT0FBTyxnQkFBTyxDQUFDLHNCQUFVLENBQUMsQ0FBQztBQUM3QixDQUFDO0FBRkQsOENBRUM7QUFFRCxzQkFBNkIsTUFBYztJQUN6QyxPQUFPLGdCQUFNLENBQUMsSUFBSSxDQUFDLHlCQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUM1QyxDQUFDO0FBRkQsb0NBRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyByZWFkRmlsZVN5bmMgYXMgcmVhZEZpbGUsIHJlYWRkaXJTeW5jIGFzIHJlYWRkaXIsIGV4aXN0c1N5bmMgYXMgZXhpc3RzLCB1bmxpbmtTeW5jIGFzIHVubGluayB9IGZyb20gJ2ZzJztcbmltcG9ydCBjcmVhdGVEZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5pbXBvcnQgeyBzeW5jIGFzIGNvbW1hbmRFeGlzdHMgfSBmcm9tICdjb21tYW5kLWV4aXN0cyc7XG5pbXBvcnQgcmltcmFmIGZyb20gJ3JpbXJhZic7XG5pbXBvcnQge1xuICBpc01hYyxcbiAgaXNMaW51eCxcbiAgaXNXaW5kb3dzLFxuICBwYXRoRm9yRG9tYWluLFxuICBkb21haW5zRGlyLFxuICByb290Q0FLZXlQYXRoXG59IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCBjdXJyZW50UGxhdGZvcm0gZnJvbSAnLi9wbGF0Zm9ybXMnO1xuaW1wb3J0IGluc3RhbGxDZXJ0aWZpY2F0ZUF1dGhvcml0eSBmcm9tICcuL2NlcnRpZmljYXRlLWF1dGhvcml0eSc7XG5pbXBvcnQgZ2VuZXJhdGVEb21haW5DZXJ0aWZpY2F0ZSBmcm9tICcuL2NlcnRpZmljYXRlcyc7XG5pbXBvcnQgVUksIHsgVXNlckludGVyZmFjZSB9IGZyb20gJy4vdXNlci1pbnRlcmZhY2UnO1xuXG5jb25zdCBkZWJ1ZyA9IGNyZWF0ZURlYnVnKCdkZXZjZXJ0Jyk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgT3B0aW9ucyB7XG4gIHNraXBDZXJ0dXRpbEluc3RhbGw/OiB0cnVlLFxuICBza2lwSG9zdHNGaWxlPzogdHJ1ZSxcbiAgdWk/OiBVc2VySW50ZXJmYWNlXG59XG5cbi8qKlxuICogUmVxdWVzdCBhbiBTU0wgY2VydGlmaWNhdGUgZm9yIHRoZSBnaXZlbiBhcHAgbmFtZSBzaWduZWQgYnkgdGhlIGRldmNlcnQgcm9vdFxuICogY2VydGlmaWNhdGUgYXV0aG9yaXR5LiBJZiBkZXZjZXJ0IGhhcyBwcmV2aW91c2x5IGdlbmVyYXRlZCBhIGNlcnRpZmljYXRlIGZvclxuICogdGhhdCBhcHAgbmFtZSBvbiB0aGlzIG1hY2hpbmUsIGl0IHdpbGwgcmV1c2UgdGhhdCBjZXJ0aWZpY2F0ZS5cbiAqXG4gKiBJZiB0aGlzIGlzIHRoZSBmaXJzdCB0aW1lIGRldmNlcnQgaXMgYmVpbmcgcnVuIG9uIHRoaXMgbWFjaGluZSwgaXQgd2lsbFxuICogZ2VuZXJhdGUgYW5kIGF0dGVtcHQgdG8gaW5zdGFsbCBhIHJvb3QgY2VydGlmaWNhdGUgYXV0aG9yaXR5LlxuICpcbiAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB7IGtleSwgY2VydCB9LCB3aGVyZSBga2V5YCBhbmQgYGNlcnRgXG4gKiBhcmUgQnVmZmVycyB3aXRoIHRoZSBjb250ZW50cyBvZiB0aGUgY2VydGlmaWNhdGUgcHJpdmF0ZSBrZXkgYW5kIGNlcnRpZmljYXRlXG4gKiBmaWxlLCByZXNwZWN0aXZlbHlcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNlcnRpZmljYXRlRm9yKGRvbWFpbjogc3RyaW5nLCBvcHRpb25zOiBPcHRpb25zID0ge30pIHtcbiAgZGVidWcoYENlcnRpZmljYXRlIHJlcXVlc3RlZCBmb3IgJHsgZG9tYWluIH0uIFNraXBwaW5nIGNlcnR1dGlsIGluc3RhbGw6ICR7IEJvb2xlYW4ob3B0aW9ucy5za2lwQ2VydHV0aWxJbnN0YWxsKSB9LiBTa2lwcGluZyBob3N0cyBmaWxlOiAkeyBCb29sZWFuKG9wdGlvbnMuc2tpcEhvc3RzRmlsZSkgfWApO1xuXG4gIGlmIChvcHRpb25zLnVpKSB7XG4gICAgT2JqZWN0LmFzc2lnbihVSSwgb3B0aW9ucy51aSk7XG4gIH1cblxuICBpZiAoIWlzTWFjICYmICFpc0xpbnV4ICYmICFpc1dpbmRvd3MpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFBsYXRmb3JtIG5vdCBzdXBwb3J0ZWQ6IFwiJHsgcHJvY2Vzcy5wbGF0Zm9ybSB9XCJgKTtcbiAgfVxuXG4gIGlmICghY29tbWFuZEV4aXN0cygnb3BlbnNzbCcpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdPcGVuU1NMIG5vdCBmb3VuZDogT3BlblNTTCBpcyByZXF1aXJlZCB0byBnZW5lcmF0ZSBTU0wgY2VydGlmaWNhdGVzIC0gbWFrZSBzdXJlIGl0IGlzIGluc3RhbGxlZCBhbmQgYXZhaWxhYmxlIGluIHlvdXIgUEFUSCcpO1xuICB9XG5cbiAgbGV0IGRvbWFpbktleVBhdGggPSBwYXRoRm9yRG9tYWluKGRvbWFpbiwgYHByaXZhdGUta2V5LmtleWApO1xuICBsZXQgZG9tYWluQ2VydFBhdGggPSBwYXRoRm9yRG9tYWluKGRvbWFpbiwgYGNlcnRpZmljYXRlLmNydGApO1xuXG4gIGlmIChwcm9jZXNzLmVudi5SRUdFTl9DRVJUKSB7XG4gICAgdHJ5IHtcbiAgICAgIHVubGluayhyb290Q0FLZXlQYXRoKTtcbiAgICB9IGNhdGNoIChlKXsgfVxuICAgIHRyeSB7XG4gICAgICB1bmxpbmsocGF0aEZvckRvbWFpbihkb21haW4sIGBjZXJ0aWZpY2F0ZS5jcnRgKSk7XG4gICAgfSBjYXRjaCAoZSl7IH1cbiAgfVxuXG4gIGlmICghZXhpc3RzKHJvb3RDQUtleVBhdGgpKSB7XG4gICAgZGVidWcoJ1Jvb3QgQ0EgaXMgbm90IGluc3RhbGxlZCB5ZXQsIHNvIGl0IG11c3QgYmUgb3VyIGZpcnN0IHJ1bi4gSW5zdGFsbGluZyByb290IENBIC4uLicpO1xuICAgIGF3YWl0IGluc3RhbGxDZXJ0aWZpY2F0ZUF1dGhvcml0eShvcHRpb25zKTtcbiAgfVxuXG4gIGlmICghZXhpc3RzKHBhdGhGb3JEb21haW4oZG9tYWluLCBgY2VydGlmaWNhdGUuY3J0YCkpIHx8IHByb2Nlc3MuZW52LlJFR0VOX0NFUlQpIHtcbiAgICBkZWJ1ZyhgQ2FuJ3QgZmluZCBjZXJ0aWZpY2F0ZSBmaWxlIGZvciAkeyBkb21haW4gfSwgc28gaXQgbXVzdCBiZSB0aGUgZmlyc3QgcmVxdWVzdCBmb3IgJHsgZG9tYWluIH0uIEdlbmVyYXRpbmcgYW5kIGNhY2hpbmcgLi4uYCk7XG4gICAgYXdhaXQgZ2VuZXJhdGVEb21haW5DZXJ0aWZpY2F0ZShkb21haW4pO1xuICB9XG5cbiAgaWYgKCFvcHRpb25zLnNraXBIb3N0c0ZpbGUpIHtcbiAgICBhd2FpdCBjdXJyZW50UGxhdGZvcm0uYWRkRG9tYWluVG9Ib3N0RmlsZUlmTWlzc2luZyhkb21haW4pO1xuICB9XG5cbiAgZGVidWcoYFJldHVybmluZyBkb21haW4gY2VydGlmaWNhdGVgKTtcbiAgcmV0dXJuIHtcbiAgICBrZXk6IHJlYWRGaWxlKGRvbWFpbktleVBhdGgpLFxuICAgIGNlcnQ6IHJlYWRGaWxlKGRvbWFpbkNlcnRQYXRoKVxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzQ2VydGlmaWNhdGVGb3IoZG9tYWluOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGV4aXN0cyhwYXRoRm9yRG9tYWluKGRvbWFpbiwgYGNlcnRpZmljYXRlLmNydGApKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbmZpZ3VyZWREb21haW5zKCkge1xuICByZXR1cm4gcmVhZGRpcihkb21haW5zRGlyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZURvbWFpbihkb21haW46IHN0cmluZykge1xuICByZXR1cm4gcmltcmFmLnN5bmMocGF0aEZvckRvbWFpbihkb21haW4pKTtcbn1cbiJdfQ==