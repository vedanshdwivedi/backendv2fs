const { Analytics } = require("@segment/analytics-node");
const dotenv = require("dotenv");
const { logger } = require("./logger");

dotenv.config();

const analytics = new Analytics({ writeKey: process.env.SEGMENT_KEY });

const trackMixPanelEvent = (
  eventName,
  eventData,
  distinctId = "[NODE BACKEND]"
) => {
    logger.info(
    `[Segment] Sending Mixpanel Event, User : ${distinctId}, Event -> ${JSON.stringify(
      eventName
    )}, Data -> ${JSON.stringify(eventData)}`
  );
  try {
    analytics.track({
      userId: distinctId,
      event: eventName,
      properties: eventData,
    });
    logger.info(`[Segment] MixPanel Event Sent : ${JSON.stringify(eventName)}`);
  } catch (err) {
    logger.info(
      `[Segment] Error in Logging Mixpanel Event ${JSON.stringify(
        eventName
      )}, data : ${JSON.stringify(eventData)}. Error : ${JSON.stringify(err)}`
    );
  }
};

module.exports = {
  trackMixPanelEvent,
};
