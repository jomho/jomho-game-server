const wrap = async function (promise) {
    try {
        const result = await promise;
        return [null, result];
    } catch (err) {
        return [err, null];
    }
}

module.exports = {
    wrap,
};