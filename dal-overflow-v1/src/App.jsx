import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

export default function App() {
  return (
    <div className="background-page">
      <div className="header-bar">
        <div>
          <p>BRAND</p>
        </div>
        <div className="search-bar">
          <input type="text" placeholder="Search..." />
        </div>
        <div>
          <button>Log in</button>
        </div>
        <div>
          <button>Sign Up</button>
        </div>
      </div>

      <div className="nav-bar">
        <div className="home">
          <img src="" alt="" srcSet="" />
          <p>Home</p>
        </div>
        <div className="explore">
          <img src="" alt="" srcSet="" />
          <p>Explore</p>
        </div>
        <div className="answers">
          <img src="" alt="" srcSet="" />
          <p>Answers</p>
        </div>
        <div className="ai">
          <img src="" alt="" srcSet="" />
          <p>AI</p>
        </div>
        <hr />
        <div className="categories">
          <img src="" alt="" srcSet="" />
          <p>Categories</p>
        </div>
        <hr />
        <div className="create-forum">
          <img src="" alt="" srcSet="" />
          <p>Create Forum</p>
        </div>
        <div className="manage-forums">
          <img src="" alt="" srcSet="" />
          <p>Manage Forums</p>
        </div>
      </div>

      <div className="main-body">
        <div className="centre-body">
          <div className="filter-question-div">
            <div className="filer">
              <button>Best</button>
              <button>Filter</button>
            </div>
            <div>
              <button>New Question</button>
            </div>
          </div>
          <div className="tiles">
            <div className="tile">
              <div className="tile-centre">
                <div className="question">
                  Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                  Quam, voluptates impedit harum minima recusandae, esse
                  voluptas asperiores, eligendi neque saepe voluptatum optio
                  necessitatibus architecto rem consequuntur odio hic
                  praesentium soluta!
                </div>
                <hr />
                <div className="answer">
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vero
                  consequuntur incidunt asperiores placeat. Enim ducimus, ipsam
                  dolorem amet sapiente aperiam quidem fugiat sed, suscipit id
                  minima explicabo consequuntur! Quis, dicta. Quis, assumenda
                  sed sequi quia possimus, autem maiores provident nostrum
                  magnam quisquam voluptatum, cum maxime alias deserunt
                  blanditiis dignissimos ullam impedit veritatis asperiores
                  necessitatibus officiis dolorem! Quasi ad rerum quia?
                  Doloremque amet est exercitationem sint earum ducimus
                  inventore ex! Dignissimos facilis et, veritatis molestias fuga
                  repellendus dicta assumenda corporis quas. Nihil, qui.
                  Deserunt cumque omnis minima facilis, libero quibusdam
                  inventore.
                </div>
              </div>
              <div className="tile-right">
                <div className="votes">
                  <button className="upvote">
                    <img src="Upvote1.jpeg" alt="" />
                  </button>
                  <p className="counter"></p>
                  <button className="downvote">
                    <img src="/Downvote1.jpeg" alt="" />
                  </button>
                </div>
                <div className="comments">
                  <img src="" alt="" />
                  <p className="comment-counter"></p>
                </div>
                <div className="views">
                  <p>Views</p>
                  <p className="views-counter"></p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="right-body">
          <div className="holder-tiles">
            <div className="holder"></div>
            <div className="holder"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
