/**
 * Analytics Service - Mock implementation
 * TODO: Replace with real analytics service (Google Analytics, Mixpanel, etc.)
 */

const IS_DEVELOPMENT = import.meta.env.DEV;

/**
 * Track an analytics event
 * @param {String} eventName - Name of the event (e.g., 'fomo_shown', 'button_click')
 * @param {Object} properties - Event properties/metadata
 */
export const track = (eventName, properties = {}) => {
  if (IS_DEVELOPMENT) {
    console.log('[Analytics] Event:', eventName, properties);
  }

  // TODO: Integrate with real analytics service
  // Example for Google Analytics 4:
  // if (window.gtag) {
  //   window.gtag('event', eventName, properties);
  // }

  // Example for Mixpanel:
  // if (window.mixpanel) {
  //   window.mixpanel.track(eventName, properties);
  // }

  // For now, just log to console
  try {
    // Store events in sessionStorage for debugging
    const events = JSON.parse(sessionStorage.getItem('analytics_events') || '[]');
    events.push({
      eventName,
      properties,
      timestamp: new Date().toISOString()
    });
    sessionStorage.setItem('analytics_events', JSON.stringify(events));
  } catch (error) {
    console.error('[Analytics] Error storing event:', error);
  }
};

/**
 * Track a page view
 * @param {String} pageName - Name of the page
 * @param {Object} properties - Page properties
 */
export const pageView = (pageName, properties = {}) => {
  track('page_view', { pageName, ...properties });
};

/**
 * Identify a user
 * @param {String|Number} userId - User ID
 * @param {Object} traits - User traits/properties
 */
export const identify = (userId, traits = {}) => {
  if (IS_DEVELOPMENT) {
    console.log('[Analytics] Identify:', userId, traits);
  }

  // TODO: Integrate with real analytics service
  // Example for Mixpanel:
  // if (window.mixpanel) {
  //   window.mixpanel.identify(userId);
  //   window.mixpanel.people.set(traits);
  // }
};

/**
 * Get all tracked events (for debugging)
 * @returns {Array} Array of events
 */
export const getEvents = () => {
  try {
    return JSON.parse(sessionStorage.getItem('analytics_events') || '[]');
  } catch (error) {
    console.error('[Analytics] Error getting events:', error);
    return [];
  }
};

/**
 * Clear all tracked events (for debugging)
 */
export const clearEvents = () => {
  sessionStorage.removeItem('analytics_events');
  if (IS_DEVELOPMENT) {
    console.log('[Analytics] Events cleared');
  }
};

export default {
  track,
  pageView,
  identify,
  getEvents,
  clearEvents
};
