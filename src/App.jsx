import { useState } from 'react'
import './App.css'
import { faSearch, faMultiply } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal from 'react-modal';

Modal.setAppElement("#root");

function App() {

  //Use state for card name search value
  const [cardName, setCardName] = useState("");

  //Use state for data
  const [data, setData] = useState([]);

  //Use state for list of images
  const [imageList, setImageList] = useState([]);

  //Use state for number of cards
  const [numCards, setNumCards] = useState("");

  //Use state for modal pop up
  const [modal, setModal] = useState(false);

  //Use state for selected card
  const [selectedCard, setSelectedCard] = useState({
    name: "",
    image_uris: {normal: ""},
    type_line: "",
    oracle_text: "",
    mana_cost: ""
  });

  //Handle card seach to Scryfall API
  const searchCard = async() => {
    if (cardName != "" && cardName.length <= 100) {
      setData([]);
      setImageList([]);
      try {
        //Make request
        const response = await fetch(`https://api.scryfall.com/cards/search?q=name:${encodeURIComponent(cardName)}`);
        const resultJson = await response.json();

        //Iterate through data, get card image if possible
        const images = [];
        const removeCards = [];
        for (let i = 0; i < resultJson.data.length; i++) {
          try {
            //Test if oracle_text is present
            try {
              const o_test = resultJson.data[i].oracle_text.split("\n");
            } catch (error) {
              //If not present, go through all card faces and add to oracle_text
              const faces = resultJson.data[i].card_faces.length;
              resultJson.data[i].oracle_text = "";
              for (let j = 0; j < faces; j++) {
                let face_text = resultJson.data[i].card_faces[j].oracle_text;
                resultJson.data[i].oracle_text += " | " + face_text;
              }
              resultJson.data[i].oracle_text = resultJson.data[i].oracle_text.substring(3);
            }
            images.push(resultJson.data[i].image_uris.normal)
          } catch (error) {
            removeCards.push(i);
          }
        }

        //Remove cards without an image
        for (let i = 0; i < removeCards.length; i++) {
          resultJson.data.splice(removeCards[i], 1);
        }

        //Set data
        setData(resultJson.data);

        //Set image list
        setImageList(images);

        //Set num cards
        const cards = resultJson.data.length;
        if (cards == 1) {
          setNumCards(cards + " card found for '" + cardName + "'");
        } else {
          setNumCards(cards + " cards found for '" + cardName + "'");
        }
      } catch (error) {
          //Set num cards to none
          setNumCards("No cards found for '" + cardName + "'");
      }
    }
  }

  //Clear search and image list
  function clearSearch() {
    setCardName("");
    setImageList([]);
    setNumCards("");
  }

  //Create image components based on imageList
  const ImageList = () => {
    return (
      <div id="image-list">
        {imageList.map((url, index) => (
          <img className="card-image" key={index} src={url} onClick={() => showCardDetails(index)}/>
        ))}
      </div>
    )
  }

  //Set selected card and show modal
  function showCardDetails(index) {
    setSelectedCard(data[index]);
    console.log(data[index]);
    setModal(true);
  }

  //Close card details
  function closeCardDetails() {
    setModal(false);
  }

  //Create card modal
  const CardModal = () => {
    return (
      <Modal id="card-modal"
        isOpen={modal}
        contentLabel="Example Modal"
        onRequestClose={() => closeCardDetails()}
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
          },
          content: {
            width: '750px',
            height: '500px',
            margin: 'auto',
            borderRadius: '10px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
            backgroundColor: 'rgb(255, 251, 234)',
          },
        }}
      >
        <div id="modal-header">
          <div id="modal-heading">
            <text id="modal-heading-name">{selectedCard.name.replace(new RegExp("//", 'g'), "|")}</text>
            <text id="modal-heading-mana">{selectedCard.mana_cost.replace(new RegExp("//", 'g'), "|")}</text>
          </div>
          <button id="modal-button" onClick={() => closeCardDetails()}>
            <FontAwesomeIcon icon={faMultiply}/>
          </button>
        </div>
        <div id="modal-info">
          <img id="modal-card" className="card-image" src={selectedCard.image_uris.normal}/>
          <div id="modal-stats">
            <text>{selectedCard.type_line.replace(new RegExp("//", 'g'), "|")}</text>
            <text>{selectedCard.oracle_text.replace(new RegExp("\n", 'g'), "\n\n")}</text>
          </div>
        </div>
      </Modal>
    )
  }

  //Create all components
  return (
    <div id="mtgcardsearch">
      <CardModal/>
      <div id="header">
        <text id="heading">MTG Card Search</text>
        <div id="search-panel">
          <button id="go"
            onClick={() => searchCard()}>
            <FontAwesomeIcon icon={faSearch}/>
          </button>
          <input id="search-bar" 
            placeholder="Search card..."
            autoComplete="off"
            onClick={() => setCardName("")}
            onKeyDown={(e) => {if(e.key == "Enter") {searchCard()}}}
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}>
          </input>
          <button id="clear"
            onClick={() => clearSearch()}>
            <FontAwesomeIcon icon={faMultiply}/>
          </button>
        </div>
        <text id="num-cards">{numCards}</text>
      </div>
      <ImageList value={imageList}></ImageList>
    </div>
  )
}

export default App
