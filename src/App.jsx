import { useState } from 'react'
import './App.css'

function App() {

  //Use state for card name search value
  const [cardName, setCardName] = useState("");

  //Use state for list of images
  const [imageList, setImageList] = useState([]);

  //Create image components based on imageList
  const ImageList = () => {
    return (
      <div id="image-list">
        {imageList.map((url, index) => (
          <img className="card-image" key={index} src={url}/>
        ))}
      </div>
    )
  }

  //Handle card seach to Scryfall API
  const searchCard = async() => {
    if (cardName != "") { 
      setImageList([]);
      try {
        //Make request
        const response = await fetch(`https://api.scryfall.com/cards/search?q=name:${encodeURIComponent(cardName)}`);
        const data = await response.json();
        const images = [];

        //Iterate through data, get card image if possible
        for (let i = 0; i < data.data.length; i++) {
          try {
            images.push(data.data[i].image_uris.normal)
          } catch (error) {
            continue;
          }
        }

        //Set image list
        setImageList(images);
      } catch (error) {
          return;
      }
    }
  }

  //Clear search and image list
  function clearSearch() {
    setCardName("");
    setImageList([]);
  }

  //Create all components
  return (
    <div id="mtgcardsearch">
      <div id="search-panel">
        <input id="search-bar" 
          placeholder="Search card..."
          autoComplete="off"
          onClick={() => setCardName("")}
          onKeyDown={(e) => {if(e.key == "Enter") {searchCard()}}}
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}>
        </input>
        <div id="buttons">
          <button id="go"
            onClick={() => searchCard()}>
            Go
          </button>
          <button id="clear"
            onClick={() => clearSearch()}>
            Clear
          </button>
        </div>
      </div>
      <ImageList value={imageList}></ImageList>
    </div>
  )
}

export default App
