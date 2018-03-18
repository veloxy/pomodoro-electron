const {remote, shell} = require('electron')
const { Menu, MenuItem } = remote

const settings = require('electron-settings');

const $ = require('jquery');

function getSettings() {
  if (settings.get('slack')) {
    $('#slack').prop('checked', true);
    $('#slackSettings').show();
  }

  if (settings.get('slack_status')) {
    $('#slack_status').prop('checked', true);
    $('#slack_status_settings').show();
  }

  if (settings.get('slack_do_not_disturb')) {
    $('#slack_do_not_disturb').prop('checked', true);
  }

  $('#slack_token').val(settings.get('slack_token'));
  $('#slack_status_emoji').val(settings.get('slack_status_emoji'));
  $('#slack_status_message').val(settings.get('slack_status_message'));
}

$(document).ready(function () {
  $(document).on('click', 'a[href^="http"]', function(event) {
    event.preventDefault();
    shell.openExternal(this.href);
  });

  getSettings();

  $('#slack').change(function () {
    if (this.checked) {
      $('#slackSettings').show();
    } else {
      $('#slackSettings').hide();
    }
  });

  $('#slack_status').change(function () {
    if (this.checked) {
      $('#slack_status_settings').show();
    } else {
      $('#slack_status_settings').hide();
    }
  });

  $('input').change(function () {
    e = $(this);
    if (e.prop('type') === 'checkbox') {
      value = e.is(':checked');
    } else {
      value = e.val();
    }

    settings.set(e.prop('id'), value);
  });

  $('input').on('input', 'input:text', function() {
    e = $(this);
    if (e.prop('type') === 'checkbox') {
      value = e.is(':checked');
    } else {
      value = e.val();
    }

    settings.set(e.prop('id'), value);
  });
});
