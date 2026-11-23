(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.MalwaiLogic = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function getWrappedIndex(current, delta, total) {
    if (total <= 0) return 0;
    return (current + delta + total) % total;
  }

  function matchesGalleryCategory(itemCategory, activeFilter) {
    if (!activeFilter || activeFilter === 'all') return true;
    if (!itemCategory) return false;
    var parts = String(itemCategory)
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    return parts.indexOf(String(activeFilter).toLowerCase()) !== -1;
  }

  function validateEnquiryFields(fields) {
    var errors = [];
    var fullName = String((fields && fields.fullName) || '').trim();
    var phone = String((fields && fields.phone) || '').trim();
    var email = String((fields && fields.email) || '').trim();
    var city = String((fields && fields.city) || '').trim();
    var eventType = String((fields && fields.eventType) || '').trim();
    var eventDate = String((fields && fields.eventDate) || '').trim();

    if (fullName.length < 2) {
      errors.push({ field: 'fullName', message: 'Please enter your full name.' });
    }
    if (!/^[+\d\s()-]{7,20}$/.test(phone)) {
      errors.push({ field: 'phone', message: 'Please enter a valid contact phone number.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({ field: 'email', message: 'Please enter a valid email address.' });
    }
    if (!city) {
      errors.push({ field: 'city', message: 'Please specify the event city.' });
    }
    if (!eventType) {
      errors.push({ field: 'eventType', message: 'Please select an event type.' });
    }
    if (!eventDate) {
      errors.push({ field: 'eventDate', message: 'Please choose a preferred event date.' });
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  return {
    getWrappedIndex: getWrappedIndex,
    matchesGalleryCategory: matchesGalleryCategory,
    validateEnquiryFields: validateEnquiryFields
  };
});
