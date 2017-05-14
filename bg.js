// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/*
 * Plays messenger/hangouts notifications randomly through the day.
 * Extremely annoying.
 */

var base_url = 'http://web.mit.edu/dannybd/Public/';
 
var pings = {
  'messenger': 'ping_messenger.ogg',
  'hangouts': 'incoming_message_hangouts.mp3',
  'hangouts_video': 'incoming_video_short_hangouts.mp3',
};

var sounds = {};

function playSound(id, loop) {
  var sound = sounds[id];
  console.log("playsound: " + id);
  if (sound && sound.src) {
    if (!sound.paused) {
      if (sound.currentTime < 0.2) {
        console.log("ignoring fast replay: " + id + "/" + sound.currentTime);
        return;
      }
      sound.pause();
      sound.currentTime = 0;
    }
    if (loop)
      sound.loop = loop;

    // Sometimes, when playing multiple times, readyState is HAVE_METADATA.
    if (sound.readyState == 0) {  // HAVE_NOTHING
      console.log("bad ready state: " + sound.readyState);
    } else if (sound.error) {
      console.log("media error: " + sound.error);
    } else {
      sound.play();
    }
  } else {
    console.log("bad playSound: " + id);
  }
}

function stopSound(id) {
  console.log("stopSound: " + id);
  var sound = sounds[id];
  if (sound && sound.src && !sound.paused) {
    sound.pause();
    sound.currentTime = 0;
  }
}

function soundLoadError(audio, id) {
  console.log("failed to load sound: " + id + "-" + audio.src);
  audio.src = "";
}

function soundLoaded(audio, id) {
  console.log("loaded sound: " + id);
  sounds[id] = audio;
}

// Hack to keep a reference to the objects while we're waiting for them to load.
var notYetLoaded = {};

function loadSound(file, id) {
  if (!file.length) {
    console.log("no sound for " + id);
    return;
  }
  var audio = new Audio();
  audio.id = id;
  audio.onerror = function() { soundLoadError(audio, id); };
  audio.addEventListener("canplaythrough",
      function() { soundLoaded(audio, id); }, false);
  audio.src = base_url + file;
  audio.load();
  notYetLoaded[id] = audio;
}

//////////////////////////////////////////////////////

// Load the sounds and register event listeners.
for (var type in pings) {
  loadSound(pings[type], type);
}

function getRandomDelay() {
  var min_ms = 10 * 1000;
  var range_ms = 60 * 60 * 1000;
  var delay = (min_ms + Math.floor(Math.random() * range_ms));
  console.log('delay (seconds):', delay / 1000);
  return delay;
}

function playRandomNoise() {
  // Only fire not in the middle of the night
  if ((new Date()).getHours() > 8) {    
    var keys = Object.keys(sounds);
    var random_key = keys[Math.floor(Math.random() * keys.length)];
    playSound(random_key, 0);
  }
  setTimeout(function() {playRandomNoise();}, getRandomDelay());
}

setTimeout(function() {playRandomNoise();}, getRandomDelay());
