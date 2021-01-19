"use strict";
const { sanitizeEntity } = require("strapi-utils");
const moment = require("moment");

function checkIfShouldPlay(video) {
  const videoStart = moment(video.time.substr(1, 5), "HH:mm");
  const duration = video.duration.split(":");
  const videoEnd = moment(videoStart)
    .add(duration[0] || 0, "hours")
    .add(duration[1] || 0, "minutes")
    .add(duration[2] || 0, "seconds");

  return moment().isAfter(videoStart) && moment().isBefore(videoEnd);
}

function getLiveNowAndUpNext(videos) {
  const index = videos.findIndex((video) => checkIfShouldPlay(video));

  return {
    liveNow: videos[index] || null,
    upNext: videos[index + 1] || null,
  };
}

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async liveNow(ctx) {
    const entity = await strapi.services["live-tv-schedule"].find();

    let todayEntity;
    const daySchedule = entity.daySchedule;

    let temp;

    temp = daySchedule.filter((day) =>
      moment(day.date).isSame(moment(), "day")
    );

    // In case there is more than one today entity
    todayEntity = temp.length ? temp[0] : null;

    const today = sanitizeEntity(todayEntity, {
      model: strapi.models["live-tv-schedule"],
    });

    const todaysVideos = today.video;

    const liveNowAndUpNext = getLiveNowAndUpNext(todaysVideos);

    return {
      today,
      ...liveNowAndUpNext,
    };
  },
};
