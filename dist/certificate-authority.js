"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = require("fs");
const rimraf_1 = require("rimraf");
const debug_1 = tslib_1.__importDefault(require("debug"));
const constants_1 = require("./constants");
const platforms_1 = tslib_1.__importDefault(require("./platforms"));
const utils_1 = require("./utils");
const certificates_1 = require("./certificates");
const debug = debug_1.default('devcert:certificate-authority');
/**
 * Install the once-per-machine trusted root CA. We'll use this CA to sign
 * per-app certs.
 */
function installCertificateAuthority(options = {}) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        debug(`Checking if older devcert install is present`);
        scrubOldInsecureVersions();
        debug(`Generating a root certificate authority`);
        let rootKeyPath = utils_1.mktmp();
        let rootCertPath = utils_1.mktmp();
        debug(`Generating the OpenSSL configuration needed to setup the certificate authority`);
        seedConfigFiles();
        debug(`Generating a private key`);
        certificates_1.generateKey(rootKeyPath);
        debug(`Generating a CA certificate`);
        utils_1.openssl(`req -new -x509 -config "${constants_1.caSelfSignConfig}" -key "${rootKeyPath}" -out "${rootCertPath}" -days 825`);
        debug('Saving certificate authority credentials');
        yield saveCertificateAuthorityCredentials(rootKeyPath, rootCertPath);
        debug(`Adding the root certificate authority to trust stores`);
        yield platforms_1.default.addToTrustStores(rootCertPath, options);
    });
}
exports.default = installCertificateAuthority;
/**
 * Older versions of devcert left the root certificate keys unguarded and
 * accessible by userland processes. Here, we check for evidence of this older
 * version, and if found, we delete the root certificate keys to remove the
 * attack vector.
 */
function scrubOldInsecureVersions() {
    // Use the old verion's logic for determining config directory
    let configDir;
    if (constants_1.isWindows && process.env.LOCALAPPDATA) {
        configDir = path_1.default.join(process.env.LOCALAPPDATA, 'devcert', 'config');
    }
    else {
        let uid = process.getuid && process.getuid();
        let userHome = (constants_1.isLinux && uid === 0) ? path_1.default.resolve('/usr/local/share') : require('os').homedir();
        configDir = path_1.default.join(userHome, '.config', 'devcert');
    }
    // Delete the root certificate keys, as well as the generated app certificates
    debug(`Checking ${configDir} for legacy files ...`);
    [
        path_1.default.join(configDir, 'openssl.conf'),
        path_1.default.join(configDir, 'devcert-ca-root.key'),
        path_1.default.join(configDir, 'devcert-ca-root.crt'),
        path_1.default.join(configDir, 'devcert-ca-version'),
        path_1.default.join(configDir, 'certs')
    ].forEach((filepath) => {
        if (fs_1.existsSync(filepath)) {
            debug(`Removing legacy file: ${filepath}`);
            rimraf_1.sync(filepath);
        }
    });
}
/**
 * Initializes the files OpenSSL needs to sign certificates as a certificate
 * authority, as well as our CA setup version
 */
function seedConfigFiles() {
    // This is v2 of the devcert certificate authority setup
    fs_1.writeFileSync(constants_1.caVersionFile, '2');
    // OpenSSL CA files
    fs_1.writeFileSync(constants_1.opensslDatabaseFilePath, '');
    fs_1.writeFileSync(constants_1.opensslSerialFilePath, '01');
}
function withCertificateAuthorityCredentials(cb) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        debug(`Retrieving devcert's certificate authority credentials`);
        let tmpCAKeyPath = utils_1.mktmp();
        let tmpCACertPath = utils_1.mktmp();
        let caKey = yield platforms_1.default.readProtectedFile(constants_1.rootCAKeyPath);
        let caCert = yield platforms_1.default.readProtectedFile(constants_1.rootCACertPath);
        fs_1.writeFileSync(tmpCAKeyPath, caKey);
        fs_1.writeFileSync(tmpCACertPath, caCert);
        yield cb({ caKeyPath: tmpCAKeyPath, caCertPath: tmpCACertPath });
        fs_1.unlinkSync(tmpCAKeyPath);
        fs_1.unlinkSync(tmpCACertPath);
    });
}
exports.withCertificateAuthorityCredentials = withCertificateAuthorityCredentials;
function saveCertificateAuthorityCredentials(keypath, certpath) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        debug(`Saving devcert's certificate authority credentials`);
        let key = fs_1.readFileSync(keypath, 'utf-8');
        let cert = fs_1.readFileSync(certpath, 'utf-8');
        yield platforms_1.default.writeProtectedFile(constants_1.rootCAKeyPath, key);
        yield platforms_1.default.writeProtectedFile(constants_1.rootCACertPath, cert);
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VydGlmaWNhdGUtYXV0aG9yaXR5LmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9qb25hdGhhbnBhcmsvc3JjL2RldmNlcnQvIiwic291cmNlcyI6WyJjZXJ0aWZpY2F0ZS1hdXRob3JpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsd0RBQXdCO0FBQ3hCLDJCQUtZO0FBQ1osbUNBQXdDO0FBQ3hDLDBEQUFnQztBQUVoQywyQ0FTcUI7QUFDckIsb0VBQTBDO0FBQzFDLG1DQUF5QztBQUN6QyxpREFBNkM7QUFHN0MsTUFBTSxLQUFLLEdBQUcsZUFBVyxDQUFDLCtCQUErQixDQUFDLENBQUM7QUFFM0Q7OztHQUdHO0FBQ0gscUNBQTBELFVBQW1CLEVBQUU7O1FBQzdFLEtBQUssQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO1FBQ3RELHdCQUF3QixFQUFFLENBQUM7UUFFM0IsS0FBSyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7UUFDakQsSUFBSSxXQUFXLEdBQUcsYUFBSyxFQUFFLENBQUM7UUFDMUIsSUFBSSxZQUFZLEdBQUcsYUFBSyxFQUFFLENBQUM7UUFFM0IsS0FBSyxDQUFDLGdGQUFnRixDQUFDLENBQUM7UUFDeEYsZUFBZSxFQUFFLENBQUM7UUFFbEIsS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUM7UUFDbEMsMEJBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUV6QixLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztRQUNyQyxlQUFPLENBQUMsMkJBQTRCLDRCQUFpQixXQUFZLFdBQVksV0FBWSxZQUFhLGFBQWEsQ0FBQyxDQUFDO1FBRXJILEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQ2xELE1BQU0sbUNBQW1DLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBRXJFLEtBQUssQ0FBQyx1REFBdUQsQ0FBQyxDQUFDO1FBQy9ELE1BQU0sbUJBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFD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QU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNyQyxJQUFJLElBQUksR0FBRyxpQkFBUSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN2QyxNQUFNLG1CQUFlLENBQUMsa0JBQWtCLENBQUMseUJBQWEsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUM3RCxNQUFNLG1CQUFlLENBQUMsa0JBQWtCLENBQUMsMEJBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNqRSxDQUFDO0NBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7XG4gIHVubGlua1N5bmMgYXMgcm0sXG4gIHJlYWRGaWxlU3luYyBhcyByZWFkRmlsZSxcbiAgd3JpdGVGaWxlU3luYyBhcyB3cml0ZUZpbGUsXG4gIGV4aXN0c1N5bmMgYXMgZXhpc3RzXG59IGZyb20gJ2ZzJztcbmltcG9ydCB7IHN5bmMgYXMgcmltcmFmIH0gZnJvbSAncmltcmFmJztcbmltcG9ydCBjcmVhdGVEZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5cbmltcG9ydCB7XG4gIHJvb3RDQUtleVBhdGgsXG4gIHJvb3RDQUNlcnRQYXRoLFxuICBjYVNlbGZTaWduQ29uZmlnLFxuICBvcGVuc3NsU2VyaWFsRmlsZVBhdGgsXG4gIG9wZW5zc2xEYXRhYmFzZUZpbGVQYXRoLFxuICBpc1dpbmRvd3MsXG4gIGlzTGludXgsXG4gIGNhVmVyc2lvbkZpbGVcbn0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IGN1cnJlbnRQbGF0Zm9ybSBmcm9tICcuL3BsYXRmb3Jtcyc7XG5pbXBvcnQgeyBvcGVuc3NsLCBta3RtcCB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHsgZ2VuZXJhdGVLZXkgfSBmcm9tICcuL2NlcnRpZmljYXRlcyc7XG5pbXBvcnQgeyBPcHRpb25zIH0gZnJvbSAnLi9pbmRleCc7XG5cbmNvbnN0IGRlYnVnID0gY3JlYXRlRGVidWcoJ2RldmNlcnQ6Y2VydGlmaWNhdGUtYXV0aG9yaXR5Jyk7XG5cbi8qKlxuICogSW5zdGFsbCB0aGUgb25jZS1wZXItbWFjaGluZSB0cnVzdGVkIHJvb3QgQ0EuIFdlJ2xsIHVzZSB0aGlzIENBIHRvIHNpZ25cbiAqIHBlci1hcHAgY2VydHMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIGluc3RhbGxDZXJ0aWZpY2F0ZUF1dGhvcml0eShvcHRpb25zOiBPcHRpb25zID0ge30pOiBQcm9taXNlPHZvaWQ+IHtcbiAgZGVidWcoYENoZWNraW5nIGlmIG9sZGVyIGRldmNlcnQgaW5zdGFsbCBpcyBwcmVzZW50YCk7XG4gIHNjcnViT2xkSW5zZWN1cmVWZXJzaW9ucygpO1xuXG4gIGRlYnVnKGBHZW5lcmF0aW5nIGEgcm9vdCBjZXJ0aWZpY2F0ZSBhdXRob3JpdHlgKTtcbiAgbGV0IHJvb3RLZXlQYXRoID0gbWt0bXAoKTtcbiAgbGV0IHJvb3RDZXJ0UGF0aCA9IG1rdG1wKCk7XG5cbiAgZGVidWcoYEdlbmVyYXRpbmcgdGhlIE9wZW5TU0wgY29uZmlndXJhdGlvbiBuZWVkZWQgdG8gc2V0dXAgdGhlIGNlcnRpZmljYXRlIGF1dGhvcml0eWApO1xuICBzZWVkQ29uZmlnRmlsZXMoKTtcblxuICBkZWJ1ZyhgR2VuZXJhdGluZyBhIHByaXZhdGUga2V5YCk7XG4gIGdlbmVyYXRlS2V5KHJvb3RLZXlQYXRoKTtcblxuICBkZWJ1ZyhgR2VuZXJhdGluZyBhIENBIGNlcnRpZmljYXRlYCk7XG4gIG9wZW5zc2woYHJlcSAtbmV3IC14NTA5IC1jb25maWcgXCIkeyBjYVNlbGZTaWduQ29uZmlnIH1cIiAta2V5IFwiJHsgcm9vdEtleVBhdGggfVwiIC1vdXQgXCIkeyByb290Q2VydFBhdGggfVwiIC1kYXlzIDgyNWApO1xuXG4gIGRlYnVnKCdTYXZpbmcgY2VydGlmaWNhdGUgYXV0aG9yaXR5IGNyZWRlbnRpYWxzJyk7XG4gIGF3YWl0IHNhdmVDZXJ0aWZpY2F0ZUF1dGhvcml0eUNyZWRlbnRpYWxzKHJvb3RLZXlQYXRoLCByb290Q2VydFBhdGgpO1xuXG4gIGRlYnVnKGBBZGRpbmcgdGhlIHJvb3QgY2VydGlmaWNhdGUgYXV0aG9yaXR5IHRvIHRydXN0IHN0b3Jlc2ApO1xuICBhd2FpdCBjdXJyZW50UGxhdGZvcm0uYWRkVG9UcnVzdFN0b3Jlcyhyb290Q2VydFBhdGgsIG9wdGlvbnMpO1xufVxuXG4vKipcbiAqIE9sZGVyIHZlcnNpb25zIG9mIGRldmNlcnQgbGVmdCB0aGUgcm9vdCBjZXJ0aWZpY2F0ZSBrZXlzIHVuZ3VhcmRlZCBhbmRcbiAqIGFjY2Vzc2libGUgYnkgdXNlcmxhbmQgcHJvY2Vzc2VzLiBIZXJlLCB3ZSBjaGVjayBmb3IgZXZpZGVuY2Ugb2YgdGhpcyBvbGRlclxuICogdmVyc2lvbiwgYW5kIGlmIGZvdW5kLCB3ZSBkZWxldGUgdGhlIHJvb3QgY2VydGlmaWNhdGUga2V5cyB0byByZW1vdmUgdGhlXG4gKiBhdHRhY2sgdmVjdG9yLlxuICovXG5mdW5jdGlvbiBzY3J1Yk9sZEluc2VjdXJlVmVyc2lvbnMoKSB7XG4gIC8vIFVzZSB0aGUgb2xkIHZlcmlvbidzIGxvZ2ljIGZvciBkZXRlcm1pbmluZyBjb25maWcgZGlyZWN0b3J5XG4gIGxldCBjb25maWdEaXI6IHN0cmluZztcbiAgaWYgKGlzV2luZG93cyAmJiBwcm9jZXNzLmVudi5MT0NBTEFQUERBVEEpIHtcbiAgICBjb25maWdEaXIgPSBwYXRoLmpvaW4ocHJvY2Vzcy5lbnYuTE9DQUxBUFBEQVRBLCAnZGV2Y2VydCcsICdjb25maWcnKTtcbiAgfSBlbHNlIHtcbiAgICBsZXQgdWlkID0gcHJvY2Vzcy5nZXR1aWQgJiYgcHJvY2Vzcy5nZXR1aWQoKTtcbiAgICBsZXQgdXNlckhvbWUgPSAoaXNMaW51eCAmJiB1aWQgPT09IDApID8gcGF0aC5yZXNvbHZlKCcvdXNyL2xvY2FsL3NoYXJlJykgOiByZXF1aXJlKCdvcycpLmhvbWVkaXIoKTtcbiAgICBjb25maWdEaXIgPSBwYXRoLmpvaW4odXNlckhvbWUsICcuY29uZmlnJywgJ2RldmNlcnQnKTtcbiAgfVxuXG4gIC8vIERlbGV0ZSB0aGUgcm9vdCBjZXJ0aWZpY2F0ZSBrZXlzLCBhcyB3ZWxsIGFzIHRoZSBnZW5lcmF0ZWQgYXBwIGNlcnRpZmljYXRlc1xuICBkZWJ1ZyhgQ2hlY2tpbmcgJHsgY29uZmlnRGlyIH0gZm9yIGxlZ2FjeSBmaWxlcyAuLi5gKTtcbiAgW1xuICAgIHBhdGguam9pbihjb25maWdEaXIsICdvcGVuc3NsLmNvbmYnKSxcbiAgICBwYXRoLmpvaW4oY29uZmlnRGlyLCAnZGV2Y2VydC1jYS1yb290LmtleScpLFxuICAgIHBhdGguam9pbihjb25maWdEaXIsICdkZXZjZXJ0LWNhLXJvb3QuY3J0JyksXG4gICAgcGF0aC5qb2luKGNvbmZpZ0RpciwgJ2RldmNlcnQtY2EtdmVyc2lvbicpLFxuICAgIHBhdGguam9pbihjb25maWdEaXIsICdjZXJ0cycpXG4gIF0uZm9yRWFjaCgoZmlsZXBhdGgpID0+IHtcbiAgICBpZiAoZXhpc3RzKGZpbGVwYXRoKSkge1xuICAgICAgZGVidWcoYFJlbW92aW5nIGxlZ2FjeSBmaWxlOiAkeyBmaWxlcGF0aCB9YClcbiAgICAgIHJpbXJhZihmaWxlcGF0aCk7XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBJbml0aWFsaXplcyB0aGUgZmlsZXMgT3BlblNTTCBuZWVkcyB0byBzaWduIGNlcnRpZmljYXRlcyBhcyBhIGNlcnRpZmljYXRlXG4gKiBhdXRob3JpdHksIGFzIHdlbGwgYXMgb3VyIENBIHNldHVwIHZlcnNpb25cbiAqL1xuZnVuY3Rpb24gc2VlZENvbmZpZ0ZpbGVzKCkge1xuICAvLyBUaGlzIGlzIHYyIG9mIHRoZSBkZXZjZXJ0IGNlcnRpZmljYXRlIGF1dGhvcml0eSBzZXR1cFxuICB3cml0ZUZpbGUoY2FWZXJzaW9uRmlsZSwgJzInKTtcbiAgLy8gT3BlblNTTCBDQSBmaWxlc1xuICB3cml0ZUZpbGUob3BlbnNzbERhdGFiYXNlRmlsZVBhdGgsICcnKTtcbiAgd3JpdGVGaWxlKG9wZW5zc2xTZXJpYWxGaWxlUGF0aCwgJzAxJyk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB3aXRoQ2VydGlmaWNhdGVBdXRob3JpdHlDcmVkZW50aWFscyhjYjogKHsgY2FLZXlQYXRoLCBjYUNlcnRQYXRoIH06IHsgY2FLZXlQYXRoOiBzdHJpbmcsIGNhQ2VydFBhdGg6IHN0cmluZyB9KSA9PiBQcm9taXNlPHZvaWQ+IHwgdm9pZCkge1xuICBkZWJ1ZyhgUmV0cmlldmluZyBkZXZjZXJ0J3MgY2VydGlmaWNhdGUgYXV0aG9yaXR5IGNyZWRlbnRpYWxzYCk7XG4gIGxldCB0bXBDQUtleVBhdGggPSBta3RtcCgpO1xuICBsZXQgdG1wQ0FDZXJ0UGF0aCA9IG1rdG1wKCk7XG4gIGxldCBjYUtleSA9IGF3YWl0IGN1cnJlbnRQbGF0Zm9ybS5yZWFkUHJvdGVjdGVkRmlsZShyb290Q0FLZXlQYXRoKTtcbiAgbGV0IGNhQ2VydCA9IGF3YWl0IGN1cnJlbnRQbGF0Zm9ybS5yZWFkUHJvdGVjdGVkRmlsZShyb290Q0FDZXJ0UGF0aCk7XG4gIHdyaXRlRmlsZSh0bXBDQUtleVBhdGgsIGNhS2V5KTtcbiAgd3JpdGVGaWxlKHRtcENBQ2VydFBhdGgsIGNhQ2VydCk7XG4gIGF3YWl0IGNiKHsgY2FLZXlQYXRoOiB0bXBDQUtleVBhdGgsIGNhQ2VydFBhdGg6IHRtcENBQ2VydFBhdGggfSk7XG4gIHJtKHRtcENBS2V5UGF0aCk7XG4gIHJtKHRtcENBQ2VydFBhdGgpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzYXZlQ2VydGlmaWNhdGVBdXRob3JpdHlDcmVkZW50aWFscyhrZXlwYXRoOiBzdHJpbmcsIGNlcnRwYXRoOiBzdHJpbmcpIHtcbiAgZGVidWcoYFNhdmluZyBkZXZjZXJ0J3MgY2VydGlmaWNhdGUgYXV0aG9yaXR5IGNyZWRlbnRpYWxzYCk7XG4gIGxldCBrZXkgPSByZWFkRmlsZShrZXlwYXRoLCAndXRmLTgnKTtcbiAgbGV0IGNlcnQgPSByZWFkRmlsZShjZXJ0cGF0aCwgJ3V0Zi04Jyk7XG4gIGF3YWl0IGN1cnJlbnRQbGF0Zm9ybS53cml0ZVByb3RlY3RlZEZpbGUocm9vdENBS2V5UGF0aCwga2V5KTtcbiAgYXdhaXQgY3VycmVudFBsYXRmb3JtLndyaXRlUHJvdGVjdGVkRmlsZShyb290Q0FDZXJ0UGF0aCwgY2VydCk7XG59XG4iXX0=