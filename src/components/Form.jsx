// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { useContext, useEffect, useState } from "react";

import styles from "./Form.module.css";
import Button from "./Button";
import BackButton from "./BackButton";
import { useUrlPosition } from "../hooks/useUrlPosition";
import Message from "./Message";
import Spinner from "./Spinner";
import { CitiesProvider, useCities } from "../context/CitiesProvider";
import { useNavigate } from "react-router-dom";


export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

const BASE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client"

function Form() {
  const [lat,lng] = useUrlPosition();  
  const {createCity, isLoading} = useCities()
  const navigate = useNavigate();
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [isLoadingGeolocation, setIsLoadingGeolocation] = useState(false)
  const [emoji, setEmoji] = useState("");
  const [geocodingError, setGeocodingError] = useState("");

  useEffect(function(){
    if(!lat && !lng ) return;
    async function fetchCityData(){
      try{
        setIsLoadingGeolocation(true);
        const res = await fetch(`${BASE_URL}?latitude=${lat}&longitude=${lng}`)
        const data = await res.json();
        console.log(data);
        if(!data.countryCode) throw new Error("Тут нету страны");
        setCityName(data.city || data.localcity);
        setCountry(data.countryName);
        setEmoji(convertToEmoji(data.countryCode))
        setGeocodingError("");
      } catch(error) {
        setGeocodingError(error.message);
      } finally {
        setIsLoadingGeolocation(false)
      }

    }
    fetchCityData()
  }, [lat,lng])

  async function handleSubmit(e) {
    e.preventDefault();
    if(!cityName || !date) return;

    const newCity = {
      cityName,
      country,
      emoji,
      date,
      notes,
      position: {
        lat,
        lng,
      }
    }

    createCity(newCity);
    navigate('/app/cities');
  }

  if(isLoadingGeolocation) return <Spinner/>
  if(!lat && !lng) return <Message message={"Кликните на карту"}/>
  if(geocodingError) return <Message message={geocodingError} />

  return (
    <form className={`${styles.form} ${isLoading ? styles.loading : ""}`} onSubmit={handleSubmit}>
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />
        <span className={styles.flag}>{emoji}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>
        <DatePicker id="date" onChange={(date) => setDate(date)} selected={date}/>
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type="primary">Add</Button>
        <BackButton />
      </div>
    </form>
  );
}

export default Form;
