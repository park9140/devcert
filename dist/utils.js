"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const child_process_1 = require("child_process");
const tmp_1 = tslib_1.__importDefault(require("tmp"));
const debug_1 = tslib_1.__importDefault(require("debug"));
const path_1 = tslib_1.__importDefault(require("path"));
const sudo_prompt_1 = tslib_1.__importDefault(require("sudo-prompt"));
const constants_1 = require("./constants");
const debug = debug_1.default('devcert:util');
function openssl(cmd) {
    return run(`openssl ${cmd}`, {
        stdio: 'pipe',
        env: Object.assign({
            RANDFILE: path_1.default.join(constants_1.configPath('.rnd'))
        }, process.env)
    });
}
exports.openssl = openssl;
function run(cmd, options = {}) {
    debug(`exec: \`${cmd}\``);
    return child_process_1.execSync(cmd, options);
}
exports.run = run;
function waitForUser() {
    return new Promise((resolve) => {
        process.stdin.resume();
        process.stdin.on('data', resolve);
    });
}
exports.waitForUser = waitForUser;
function reportableError(message) {
    return new Error(`${message} | This is a bug in devcert, please report the issue at https://github.com/davewasmer/devcert/issues`);
}
exports.reportableError = reportableError;
function mktmp() {
    // discardDescriptor because windows complains the file is in use if we create a tmp file
    // and then shell out to a process that tries to use it
    return tmp_1.default.fileSync({ discardDescriptor: true }).name;
}
exports.mktmp = mktmp;
function sudo(cmd) {
    return new Promise((resolve, reject) => {
        sudo_prompt_1.default.exec(cmd, { name: 'devcert' }, (err, stdout, stderr) => {
            let error = err || (typeof stderr === 'string' && stderr.trim().length > 0 && new Error(stderr));
            error ? reject(error) : resolve(stdout);
        });
    });
}
exports.sudo = sudo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2pvbmF0aGFucGFyay9zcmMvZGV2Y2VydC8iLCJzb3VyY2VzIjpbInV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlEQUEwRDtBQUMxRCxzREFBc0I7QUFDdEIsMERBQWdDO0FBQ2hDLHdEQUF3QjtBQUN4QixzRUFBcUM7QUFFckMsMkNBRXFCO0FBRXJCLE1BQU0sS0FBSyxHQUFHLGVBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUUxQyxpQkFBd0IsR0FBVztJQUNqQyxPQUFPLEdBQUcsQ0FBQyxXQUFZLEdBQUksRUFBRSxFQUFFO1FBQzdCLEtBQUssRUFBRSxNQUFNO1FBQ2IsR0FBRyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDakIsUUFBUSxFQUFFLGNBQUksQ0FBQyxJQUFJLENBQUMsc0JBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUN4QyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUM7S0FDaEIsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQVBELDBCQU9DO0FBRUQsYUFBb0IsR0FBVyxFQUFFLFVBQTJCLEVBQUU7SUFDNUQsS0FBSyxDQUFDLFdBQVksR0FBSSxJQUFJLENBQUMsQ0FBQztJQUM1QixPQUFPLHdCQUFRLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ2hDLENBQUM7QUFIRCxrQkFHQztBQUVEO0lBQ0UsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1FBQzdCLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDdkIsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3BDLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUxELGtDQUtDO0FBRUQseUJBQWdDLE9BQWU7SUFDN0MsT0FBTyxJQUFJLEtBQUssQ0FBQyxHQUFHLE9BQU8sc0dBQXNHLENBQUMsQ0FBQztBQUNySSxDQUFDO0FBRkQsMENBRUM7QUFFRDtJQUNFLHlGQUF5RjtJQUN6Rix1REFBdUQ7SUFDdkQsT0FBTyxhQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDeEQsQ0FBQztBQUpELHNCQUlDO0FBRUQsY0FBcUIsR0FBVztJQUM5QixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ3JDLHFCQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsRUFBRSxDQUFDLEdBQWlCLEVBQUUsTUFBcUIsRUFBRSxNQUFxQixFQUFFLEVBQUU7WUFDNUcsSUFBSSxLQUFLLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxNQUFNLEtBQUssUUFBUSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUU7WUFDbEcsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMxQyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQVBELG9CQU9DIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZXhlY1N5bmMsIEV4ZWNTeW5jT3B0aW9ucyB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHRtcCBmcm9tICd0bXAnO1xuaW1wb3J0IGNyZWF0ZURlYnVnIGZyb20gJ2RlYnVnJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHN1ZG9Qcm9tcHQgZnJvbSAnc3Vkby1wcm9tcHQnO1xuXG5pbXBvcnQge1xuICBjb25maWdQYXRoLFxufSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbmNvbnN0IGRlYnVnID0gY3JlYXRlRGVidWcoJ2RldmNlcnQ6dXRpbCcpO1xuXG5leHBvcnQgZnVuY3Rpb24gb3BlbnNzbChjbWQ6IHN0cmluZykge1xuICByZXR1cm4gcnVuKGBvcGVuc3NsICR7IGNtZCB9YCwge1xuICAgIHN0ZGlvOiAncGlwZScsXG4gICAgZW52OiBPYmplY3QuYXNzaWduKHtcbiAgICAgIFJBTkRGSUxFOiBwYXRoLmpvaW4oY29uZmlnUGF0aCgnLnJuZCcpKVxuICAgIH0sIHByb2Nlc3MuZW52KVxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJ1bihjbWQ6IHN0cmluZywgb3B0aW9uczogRXhlY1N5bmNPcHRpb25zID0ge30pIHtcbiAgZGVidWcoYGV4ZWM6IFxcYCR7IGNtZCB9XFxgYCk7XG4gIHJldHVybiBleGVjU3luYyhjbWQsIG9wdGlvbnMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd2FpdEZvclVzZXIoKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIHByb2Nlc3Muc3RkaW4ucmVzdW1lKCk7XG4gICAgcHJvY2Vzcy5zdGRpbi5vbignZGF0YScsIHJlc29sdmUpO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlcG9ydGFibGVFcnJvcihtZXNzYWdlOiBzdHJpbmcpIHtcbiAgcmV0dXJuIG5ldyBFcnJvcihgJHttZXNzYWdlfSB8IFRoaXMgaXMgYSBidWcgaW4gZGV2Y2VydCwgcGxlYXNlIHJlcG9ydCB0aGUgaXNzdWUgYXQgaHR0cHM6Ly9naXRodWIuY29tL2RhdmV3YXNtZXIvZGV2Y2VydC9pc3N1ZXNgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1rdG1wKCkge1xuICAvLyBkaXNjYXJkRGVzY3JpcHRvciBiZWNhdXNlIHdpbmRvd3MgY29tcGxhaW5zIHRoZSBmaWxlIGlzIGluIHVzZSBpZiB3ZSBjcmVhdGUgYSB0bXAgZmlsZVxuICAvLyBhbmQgdGhlbiBzaGVsbCBvdXQgdG8gYSBwcm9jZXNzIHRoYXQgdHJpZXMgdG8gdXNlIGl0XG4gIHJldHVybiB0bXAuZmlsZVN5bmMoeyBkaXNjYXJkRGVzY3JpcHRvcjogdHJ1ZSB9KS5uYW1lO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3VkbyhjbWQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHN1ZG9Qcm9tcHQuZXhlYyhjbWQsIHsgbmFtZTogJ2RldmNlcnQnIH0sIChlcnI6IEVycm9yIHwgbnVsbCwgc3Rkb3V0OiBzdHJpbmcgfCBudWxsLCBzdGRlcnI6IHN0cmluZyB8IG51bGwpID0+IHtcbiAgICAgIGxldCBlcnJvciA9IGVyciB8fCAodHlwZW9mIHN0ZGVyciA9PT0gJ3N0cmluZycgJiYgc3RkZXJyLnRyaW0oKS5sZW5ndGggPiAwICYmIG5ldyBFcnJvcihzdGRlcnIpKSA7XG4gICAgICBlcnJvciA/IHJlamVjdChlcnJvcikgOiByZXNvbHZlKHN0ZG91dCk7XG4gICAgfSk7XG4gIH0pO1xufVxuIl19