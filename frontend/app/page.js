"use client";

import Image from "next/image";
import React, { useState } from "react";
import axios from "axios";
import GenImage from "./GenImage";

export default function Home() {
  const [playlistURL, setPlaylistURL] = useState("");
  // const [bearerToken, setBearerToken] = useState("");
  const [img, setImg] = useState(null);
  const [loadingImg, setLoadingImg] = useState(false);

  const handleChange = (event) => {
    setPlaylistURL(event.target.value);
  };

  const getBearerToken = () => {
    axios
      .post(
        "https://accounts.spotify.com/api/token",
        {
          grant_type: "client_credentials",
          client_id: `${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}`,
          client_secret: `${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET}`,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      )
      .then((res) => {
        console.log(res.data);
        // setBearerToken(res.data.access_token);
        localStorage.setItem("spotifyBearerToken", res.data.access_token);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // create a function that handles creating the lead
  const handleGenerateImage = async (e, prompt) => {
    setImg(null);
    const requestOptions = {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    };

    setLoadingImg(true);
    // body: JSON.stringify(`prompt=${prompt}&num_inference_steps=${numInfSteps}&guidance_scale=${guidanceScale}&seed=`)
    const response = await fetch(
      `/api/generate/?prompt=${prompt}&num_inference_steps=20&guidance_scale=10&seed=42`,
      requestOptions
    );

    if (!response.ok) {
      setErrorMessage("Ooops! Something went wrong generating the image");
    } else {
      const imageBlob = await response.blob();
      const imageObjectURL = URL.createObjectURL(imageBlob);
      setImg(imageObjectURL);
      setLoadingImg(false);
      // setPromptImg(prompt);
      // cleanFormData();
    }
  };

  const retreivePlaylist = () => {
    const requestURL =
      "https://api.spotify.com/v1/playlists/" + playlistURL.split("/").at(-1);

    // https://open.spotify.com/playlist/6SAwGiTHoH0TzLG8oNV13i
    // getBearerToken();
    const bearerToken = localStorage.getItem("spotifyBearerToken");
    try {
      axios
        .get(requestURL, {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
        })
        .then((res) => {
          // Get a list of all the track names in the playlist
          // const tracks = res.data.tracks.items.map((track) => {
          //   return track.track.name;
          // });
          // const artists = res.data.tracks.items.map((track) => {
          //   return track.track.artists[0].name;
          // });
          // console.log(tracks);
          // console.log(artists);

          // Get the playlist name
          const playlistName = res.data.name;

          const generateImage = () => {
            // Create a message template
            const message = `Generate a playlist cover image for the following playlist and songs. Playlist Name: ${playlistName}\n\nTracks:\n`;
            const tracks = res.data.tracks.items.map((track) => {
              return `- ${track.track.name} by ${track.track.artists[0].name}\n`;
            });
            const imageText =
              message +
              tracks.join("") +
              "\n\nDon't have a grid of images, the final image should just be one image.";
            console.log(imageText);

            // Send the message template to the AI tool to generate an image
            handleGenerateImage(imageText);

            // Handle the response from the AI tool
            // ...
          };

          generateImage();
        });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {/* <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px]"> */}
      <div className="relative flex place-items-center before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40">
        <input
          type="text"
          value={playlistURL}
          onChange={handleChange}
          className="p-4 text-center border border-gray-300 rounded-lg dark:border-neutral-800"
          placeholder="Input URL here"
        />
        <button
          onClick={retreivePlaylist}
          className="p-4 text-white bg-blue-500 rounded-lg dark:bg-blue-700"
        >
          Generate
        </button>
      </div>
      <div className="relative flex place-items-center">
        {img ? (
          <figure>
            <img src={img} alt="genimage" />
          </figure>
        ) : (
          <></>
        )}
        {loadingImg ? (
          <progress className="progress is-small is-primary" max="100">
            Loading
          </progress>
        ) : (
          <></>
        )}
      </div>
    </main>
  );
}
