import { useEffect } from 'react';
import React, { useState } from 'react'

const App = () => {
  const [cars, setCars] = useState([]);
  useEffect(()=>{
    fetch('http://localhost:3000/api/v1/cars')
      .then(res => res.json())
      .then(data => setCars(data))
      .catch(err => console.log(err))

      console.log(cars);
  },[]);

  return (
    <div>
      <h1>Car Inventory</h1>
      <ul>
        {cars.map(car => (
          <li key={car.id}>
            {car.make} {car.model} - {car.year} - ${car.price}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App