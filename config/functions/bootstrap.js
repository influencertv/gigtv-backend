"use strict";

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 *
 * See more details here: https://strapi.io/documentation/v3.x/concepts/configurations.html#bootstrap
 */

module.exports = () => {
  const io = require("socket.io")(strapi.server);

  io.on("connection", (socket) => {
    console.log("connected");

    socket.on("add-comment", async ({ userId, articleId, comment }) => {
      const entry = await strapi.query("comment").create({
        text: comment,
        user: {
          id: userId,
        },
        article: {
          id: articleId,
        },
      });
      if (entry) {
        io.emit("comment-added", { articleId });
      }
    });

    socket.on("disconnect", () => {
      console.log("disconnect");
    });
  });

  strapi.io = io;
};
