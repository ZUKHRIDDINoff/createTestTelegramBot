module.exports = {
    apps: [{
        name: "testbot",
        script: "./startBot.js",
        max_memory_restart: "700M",
        instances: 8,
        autorestart: true,
    }],
};