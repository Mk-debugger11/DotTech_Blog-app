import React from 'react'
import FetchWithAuth from '../utils/fetchWithAuth'
function MyProfile() {
    FetchWithAuth(`http://127.0.0.1:8000/users/userProfile/`,{
        method:'GET',
    })
    .then((res)=>{
        return res.json()
    })
    .then((data)=>{
        console.log(data);
        
    })
  return (
    <div>MyProfile</div>
  )
}

export default MyProfile