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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VydGlmaWNhdGUtYXV0aG9yaXR5LmpzIiwic291cmNlUm9vdCI6Ii9wcml2YXRlL3RtcC9kZXZjZXJ0LWZpeC8iLCJzb3VyY2VzIjpbImNlcnRpZmljYXRlLWF1dGhvcml0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx3REFBd0I7QUFDeEIsMkJBS1k7QUFDWixtQ0FBd0M7QUFDeEMsMERBQWdDO0FBRWhDLDJDQVNxQjtBQUNyQixvRUFBMEM7QUFDMUMsbUNBQXlDO0FBQ3pDLGlEQUE2QztBQUc3QyxNQUFNLEtBQUssR0FBRyxlQUFXLENBQUMsK0JBQStCLENBQUMsQ0FBQztBQUUzRDs7O0dBR0c7QUFDSCxxQ0FBMEQsVUFBbUIsRUFBRTs7UUFDN0UsS0FBSyxDQUFDLDhDQUE4QyxDQUFDLENBQUM7UUFDdEQsd0JBQXdCLEVBQUUsQ0FBQztRQUUzQixLQUFLLENBQUMseUNBQXlDLENBQUMsQ0FBQztRQUNqRCxJQUFJLFdBQVcsR0FBRyxhQUFLLEVBQUUsQ0FBQztRQUMxQixJQUFJLFlBQVksR0FBRyxhQUFLLEVBQUUsQ0FBQztRQUUzQixLQUFLLENBQUMsZ0ZBQWdGLENBQUMsQ0FBQztRQUN4RixlQUFlLEVBQUUsQ0FBQztRQUVsQixLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQztRQUNsQywwQkFBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRXpCLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO1FBQ3JDLGVBQU8sQ0FBQywyQkFBNEIsNEJBQWlCLFdBQVksV0FBWSxXQUFZLFlBQWEsYUFBYSxDQUFDLENBQUM7UUFFckgsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFDbEQsTUFBTSxtQ0FBbUMsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFFckUsS0FBSyxDQUFDLHVEQUF1RCxDQUFDLENBQUM7UUFDL0QsTUFBTSxtQkFBZSxDQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNoRSxDQUFD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LE9BQU8sQ0FBQyxDQUFDO1FBQ3JDLElBQUksSUFBSSxHQUFHLGlCQUFRLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZDLE1BQU0sbUJBQWUsQ0FBQyxrQkFBa0IsQ0FBQyx5QkFBYSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzdELE1BQU0sbUJBQWUsQ0FBQyxrQkFBa0IsQ0FBQywwQkFBYyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2pFLENBQUM7Q0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtcbiAgdW5saW5rU3luYyBhcyBybSxcbiAgcmVhZEZpbGVTeW5jIGFzIHJlYWRGaWxlLFxuICB3cml0ZUZpbGVTeW5jIGFzIHdyaXRlRmlsZSxcbiAgZXhpc3RzU3luYyBhcyBleGlzdHNcbn0gZnJvbSAnZnMnO1xuaW1wb3J0IHsgc3luYyBhcyByaW1yYWYgfSBmcm9tICdyaW1yYWYnO1xuaW1wb3J0IGNyZWF0ZURlYnVnIGZyb20gJ2RlYnVnJztcblxuaW1wb3J0IHtcbiAgcm9vdENBS2V5UGF0aCxcbiAgcm9vdENBQ2VydFBhdGgsXG4gIGNhU2VsZlNpZ25Db25maWcsXG4gIG9wZW5zc2xTZXJpYWxGaWxlUGF0aCxcbiAgb3BlbnNzbERhdGFiYXNlRmlsZVBhdGgsXG4gIGlzV2luZG93cyxcbiAgaXNMaW51eCxcbiAgY2FWZXJzaW9uRmlsZVxufSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQgY3VycmVudFBsYXRmb3JtIGZyb20gJy4vcGxhdGZvcm1zJztcbmltcG9ydCB7IG9wZW5zc2wsIG1rdG1wIH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgeyBnZW5lcmF0ZUtleSB9IGZyb20gJy4vY2VydGlmaWNhdGVzJztcbmltcG9ydCB7IE9wdGlvbnMgfSBmcm9tICcuL2luZGV4JztcblxuY29uc3QgZGVidWcgPSBjcmVhdGVEZWJ1ZygnZGV2Y2VydDpjZXJ0aWZpY2F0ZS1hdXRob3JpdHknKTtcblxuLyoqXG4gKiBJbnN0YWxsIHRoZSBvbmNlLXBlci1tYWNoaW5lIHRydXN0ZWQgcm9vdCBDQS4gV2UnbGwgdXNlIHRoaXMgQ0EgdG8gc2lnblxuICogcGVyLWFwcCBjZXJ0cy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gaW5zdGFsbENlcnRpZmljYXRlQXV0aG9yaXR5KG9wdGlvbnM6IE9wdGlvbnMgPSB7fSk6IFByb21pc2U8dm9pZD4ge1xuICBkZWJ1ZyhgQ2hlY2tpbmcgaWYgb2xkZXIgZGV2Y2VydCBpbnN0YWxsIGlzIHByZXNlbnRgKTtcbiAgc2NydWJPbGRJbnNlY3VyZVZlcnNpb25zKCk7XG5cbiAgZGVidWcoYEdlbmVyYXRpbmcgYSByb290IGNlcnRpZmljYXRlIGF1dGhvcml0eWApO1xuICBsZXQgcm9vdEtleVBhdGggPSBta3RtcCgpO1xuICBsZXQgcm9vdENlcnRQYXRoID0gbWt0bXAoKTtcblxuICBkZWJ1ZyhgR2VuZXJhdGluZyB0aGUgT3BlblNTTCBjb25maWd1cmF0aW9uIG5lZWRlZCB0byBzZXR1cCB0aGUgY2VydGlmaWNhdGUgYXV0aG9yaXR5YCk7XG4gIHNlZWRDb25maWdGaWxlcygpO1xuXG4gIGRlYnVnKGBHZW5lcmF0aW5nIGEgcHJpdmF0ZSBrZXlgKTtcbiAgZ2VuZXJhdGVLZXkocm9vdEtleVBhdGgpO1xuXG4gIGRlYnVnKGBHZW5lcmF0aW5nIGEgQ0EgY2VydGlmaWNhdGVgKTtcbiAgb3BlbnNzbChgcmVxIC1uZXcgLXg1MDkgLWNvbmZpZyBcIiR7IGNhU2VsZlNpZ25Db25maWcgfVwiIC1rZXkgXCIkeyByb290S2V5UGF0aCB9XCIgLW91dCBcIiR7IHJvb3RDZXJ0UGF0aCB9XCIgLWRheXMgODI1YCk7XG5cbiAgZGVidWcoJ1NhdmluZyBjZXJ0aWZpY2F0ZSBhdXRob3JpdHkgY3JlZGVudGlhbHMnKTtcbiAgYXdhaXQgc2F2ZUNlcnRpZmljYXRlQXV0aG9yaXR5Q3JlZGVudGlhbHMocm9vdEtleVBhdGgsIHJvb3RDZXJ0UGF0aCk7XG5cbiAgZGVidWcoYEFkZGluZyB0aGUgcm9vdCBjZXJ0aWZpY2F0ZSBhdXRob3JpdHkgdG8gdHJ1c3Qgc3RvcmVzYCk7XG4gIGF3YWl0IGN1cnJlbnRQbGF0Zm9ybS5hZGRUb1RydXN0U3RvcmVzKHJvb3RDZXJ0UGF0aCwgb3B0aW9ucyk7XG59XG5cbi8qKlxuICogT2xkZXIgdmVyc2lvbnMgb2YgZGV2Y2VydCBsZWZ0IHRoZSByb290IGNlcnRpZmljYXRlIGtleXMgdW5ndWFyZGVkIGFuZFxuICogYWNjZXNzaWJsZSBieSB1c2VybGFuZCBwcm9jZXNzZXMuIEhlcmUsIHdlIGNoZWNrIGZvciBldmlkZW5jZSBvZiB0aGlzIG9sZGVyXG4gKiB2ZXJzaW9uLCBhbmQgaWYgZm91bmQsIHdlIGRlbGV0ZSB0aGUgcm9vdCBjZXJ0aWZpY2F0ZSBrZXlzIHRvIHJlbW92ZSB0aGVcbiAqIGF0dGFjayB2ZWN0b3IuXG4gKi9cbmZ1bmN0aW9uIHNjcnViT2xkSW5zZWN1cmVWZXJzaW9ucygpIHtcbiAgLy8gVXNlIHRoZSBvbGQgdmVyaW9uJ3MgbG9naWMgZm9yIGRldGVybWluaW5nIGNvbmZpZyBkaXJlY3RvcnlcbiAgbGV0IGNvbmZpZ0Rpcjogc3RyaW5nO1xuICBpZiAoaXNXaW5kb3dzICYmIHByb2Nlc3MuZW52LkxPQ0FMQVBQREFUQSkge1xuICAgIGNvbmZpZ0RpciA9IHBhdGguam9pbihwcm9jZXNzLmVudi5MT0NBTEFQUERBVEEsICdkZXZjZXJ0JywgJ2NvbmZpZycpO1xuICB9IGVsc2Uge1xuICAgIGxldCB1aWQgPSBwcm9jZXNzLmdldHVpZCAmJiBwcm9jZXNzLmdldHVpZCgpO1xuICAgIGxldCB1c2VySG9tZSA9IChpc0xpbnV4ICYmIHVpZCA9PT0gMCkgPyBwYXRoLnJlc29sdmUoJy91c3IvbG9jYWwvc2hhcmUnKSA6IHJlcXVpcmUoJ29zJykuaG9tZWRpcigpO1xuICAgIGNvbmZpZ0RpciA9IHBhdGguam9pbih1c2VySG9tZSwgJy5jb25maWcnLCAnZGV2Y2VydCcpO1xuICB9XG5cbiAgLy8gRGVsZXRlIHRoZSByb290IGNlcnRpZmljYXRlIGtleXMsIGFzIHdlbGwgYXMgdGhlIGdlbmVyYXRlZCBhcHAgY2VydGlmaWNhdGVzXG4gIGRlYnVnKGBDaGVja2luZyAkeyBjb25maWdEaXIgfSBmb3IgbGVnYWN5IGZpbGVzIC4uLmApO1xuICBbXG4gICAgcGF0aC5qb2luKGNvbmZpZ0RpciwgJ29wZW5zc2wuY29uZicpLFxuICAgIHBhdGguam9pbihjb25maWdEaXIsICdkZXZjZXJ0LWNhLXJvb3Qua2V5JyksXG4gICAgcGF0aC5qb2luKGNvbmZpZ0RpciwgJ2RldmNlcnQtY2Etcm9vdC5jcnQnKSxcbiAgICBwYXRoLmpvaW4oY29uZmlnRGlyLCAnZGV2Y2VydC1jYS12ZXJzaW9uJyksXG4gICAgcGF0aC5qb2luKGNvbmZpZ0RpciwgJ2NlcnRzJylcbiAgXS5mb3JFYWNoKChmaWxlcGF0aCkgPT4ge1xuICAgIGlmIChleGlzdHMoZmlsZXBhdGgpKSB7XG4gICAgICBkZWJ1ZyhgUmVtb3ZpbmcgbGVnYWN5IGZpbGU6ICR7IGZpbGVwYXRoIH1gKVxuICAgICAgcmltcmFmKGZpbGVwYXRoKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIEluaXRpYWxpemVzIHRoZSBmaWxlcyBPcGVuU1NMIG5lZWRzIHRvIHNpZ24gY2VydGlmaWNhdGVzIGFzIGEgY2VydGlmaWNhdGVcbiAqIGF1dGhvcml0eSwgYXMgd2VsbCBhcyBvdXIgQ0Egc2V0dXAgdmVyc2lvblxuICovXG5mdW5jdGlvbiBzZWVkQ29uZmlnRmlsZXMoKSB7XG4gIC8vIFRoaXMgaXMgdjIgb2YgdGhlIGRldmNlcnQgY2VydGlmaWNhdGUgYXV0aG9yaXR5IHNldHVwXG4gIHdyaXRlRmlsZShjYVZlcnNpb25GaWxlLCAnMicpO1xuICAvLyBPcGVuU1NMIENBIGZpbGVzXG4gIHdyaXRlRmlsZShvcGVuc3NsRGF0YWJhc2VGaWxlUGF0aCwgJycpO1xuICB3cml0ZUZpbGUob3BlbnNzbFNlcmlhbEZpbGVQYXRoLCAnMDEnKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdpdGhDZXJ0aWZpY2F0ZUF1dGhvcml0eUNyZWRlbnRpYWxzKGNiOiAoeyBjYUtleVBhdGgsIGNhQ2VydFBhdGggfTogeyBjYUtleVBhdGg6IHN0cmluZywgY2FDZXJ0UGF0aDogc3RyaW5nIH0pID0+IFByb21pc2U8dm9pZD4gfCB2b2lkKSB7XG4gIGRlYnVnKGBSZXRyaWV2aW5nIGRldmNlcnQncyBjZXJ0aWZpY2F0ZSBhdXRob3JpdHkgY3JlZGVudGlhbHNgKTtcbiAgbGV0IHRtcENBS2V5UGF0aCA9IG1rdG1wKCk7XG4gIGxldCB0bXBDQUNlcnRQYXRoID0gbWt0bXAoKTtcbiAgbGV0IGNhS2V5ID0gYXdhaXQgY3VycmVudFBsYXRmb3JtLnJlYWRQcm90ZWN0ZWRGaWxlKHJvb3RDQUtleVBhdGgpO1xuICBsZXQgY2FDZXJ0ID0gYXdhaXQgY3VycmVudFBsYXRmb3JtLnJlYWRQcm90ZWN0ZWRGaWxlKHJvb3RDQUNlcnRQYXRoKTtcbiAgd3JpdGVGaWxlKHRtcENBS2V5UGF0aCwgY2FLZXkpO1xuICB3cml0ZUZpbGUodG1wQ0FDZXJ0UGF0aCwgY2FDZXJ0KTtcbiAgYXdhaXQgY2IoeyBjYUtleVBhdGg6IHRtcENBS2V5UGF0aCwgY2FDZXJ0UGF0aDogdG1wQ0FDZXJ0UGF0aCB9KTtcbiAgcm0odG1wQ0FLZXlQYXRoKTtcbiAgcm0odG1wQ0FDZXJ0UGF0aCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNhdmVDZXJ0aWZpY2F0ZUF1dGhvcml0eUNyZWRlbnRpYWxzKGtleXBhdGg6IHN0cmluZywgY2VydHBhdGg6IHN0cmluZykge1xuICBkZWJ1ZyhgU2F2aW5nIGRldmNlcnQncyBjZXJ0aWZpY2F0ZSBhdXRob3JpdHkgY3JlZGVudGlhbHNgKTtcbiAgbGV0IGtleSA9IHJlYWRGaWxlKGtleXBhdGgsICd1dGYtOCcpO1xuICBsZXQgY2VydCA9IHJlYWRGaWxlKGNlcnRwYXRoLCAndXRmLTgnKTtcbiAgYXdhaXQgY3VycmVudFBsYXRmb3JtLndyaXRlUHJvdGVjdGVkRmlsZShyb290Q0FLZXlQYXRoLCBrZXkpO1xuICBhd2FpdCBjdXJyZW50UGxhdGZvcm0ud3JpdGVQcm90ZWN0ZWRGaWxlKHJvb3RDQUNlcnRQYXRoLCBjZXJ0KTtcbn1cbiJdfQ==