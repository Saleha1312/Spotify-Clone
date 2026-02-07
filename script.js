console.log("Let's do coding!!!");
let currentSong = new Audio();
let currFolder;

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  // Show all the songs in the playlist
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li><img class="invert" width="34" src="img/music.svg" alt="">
                                  <div class="info">
                                      <div>${song.replace("%20", " ")}</div>
                                      <div> </div>
                                  </div>
                                  <div class="playnow">
                                      <span>Play Now</span>
                                      <img class="invert" src="img/play.svg" alt="">
                                  </div> </li>`;
  }

  // Attach an event listener to each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return songs;
}

function secontsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const mins = Math.floor(seconds / 60);
  const remainingSecs = Math.floor(seconds % 60);

  const formattedMins = String(mins).padStart(2, "0");
  const formattedSecs = String(remainingSecs).padStart(2, "0");

  return `${formattedMins}:${formattedSecs}`;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }
  document.querySelector(".songInfo").innerHTML = track;
  document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
      let parts = e.href.split("/").filter(Boolean);
      let folder = parts[parts.length - 1];
      try {
        // Fetch album metadata
        let metaRes = await fetch(`/songs/${folder}/info.json`);
        let meta = await metaRes.json();

        // console.log("Loaded:", meta.title);

        // Append card
        cardContainer.innerHTML += `
                      <div class="card" data-folder="${folder}">
                          <div class="play">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                  stroke-linejoin="round" />
                              </svg>
                          </div>
                          <img width="50" src="/songs/${folder}/cover.jpg" alt="">
                          <h2>${meta.title}</h2>
                          <p>${meta.description}</p>
                      </div>
                  `;
      } catch (err) {
        console.warn(`Error loading album ${folder}:`, err);
      }
    }
  }
  // Load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      console.log("Fetching Songs");
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      if (songs && songs.length > 0) {
        playMusic(songs[0]);
      } else {
        console.warn("No songs found in this folder");
      }
    });
  });
}

async function main() {
  // Get the list of all songs
  await getSongs("songs/ncs");
  playMusic(songs[0], true);

  // Display all the albums on the page
  await displayAlbums();

  // Attach an event listerner to play, next and previous buttons
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  // Listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songTime").innerHTML = `${secontsToMinutesSeconds(
      currentSong.currentTime
    )} / ${secontsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Add an event listener to seekbar
  document.querySelector(".seekBar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Add an event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
    document.querySelector(".hamburger").style.display = "none"; // Hide hamburger
    document.querySelector(".close2").style.display = "block"; // Show close button in nav
    document.querySelector(".left .close").style.display = "block"; // Show the internal close button
  });

  // Add an event listener for close button (in left sidebar)
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
    document.querySelector(".hamburger").style.display = "block"; // Show hamburger
    document.querySelector(".close2").style.display = "none"; // Hide close button in nav
    document.querySelector(".left .close").style.display = "none"; // Hide the internal close button
  });

  // Add an event listener for the new close2 button in the nav
  document.querySelector(".close2").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
    document.querySelector(".hamburger").style.display = "block"; // Show hamburger
    document.querySelector(".close2").style.display = "none"; // Hide close button in nav
    document.querySelector(".left .close").style.display = "none"; // Hide the internal close button
  });

  // Add an event listener to previous
  previous.addEventListener("click", () => {
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  // Add an event listener to next
  next.addEventListener("click", () => {
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // Add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
      if (currentSong.volume > 0) {
        document.querySelector(".volume>img").src = document
          .querySelector(".volume>img")
          .src.replace("img/mute.svg", "img/volume.svg");
      }
    });

  // Add event listener to mute the track
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("img/volume.svg")) {
      e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
      currentSong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
}
main();
