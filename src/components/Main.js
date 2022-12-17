import React, { useState, useEffect } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route
  } from "react-router-dom";
import Listen from "./Listen";
import Home from "./Home";
import Weather from "./Weather";
import Calendar from "./Calendar";
import ToDo from "./ToDo";
import News from "./News";
import Camera from "./Camera";


function Main(){
    const [indicator, setIndicator] = useState("");
    const [isListen, setIsListen] = useState(false);

    let props ={
        indicator: indicator, // 어떤 화면인지 나타내는 문자열 ex) home, calendar
        setIndicator: setIndicator,
        isListen: isListen,
        setIsListen: setIsListen
    }

    window.electronAPI.handleWakeword((event, value)=>{
        setIsListen(value);
    })

    useEffect(()=>{
    }, [props.isListen]);

    useEffect(()=>{
    }, [props.indicator]);

    return(
        <>
        <Router>
            <main className="Main">
                <section className="Contents">
                    <Routes>
                        <Route exact path="/" element={<Home {...props}/>}/>
                        <Route path="/Weather" element={<Weather {...props}/>} />
                        <Route path="/Calendar" element={<Calendar {...props}/>} />
                        <Route path="/ToDo" element={<ToDo {...props}/>}/>
                        <Route path="/News" element={<News {...props}/>} />
                        <Route path="/Camera" element={<Camera {...props}/>} />
                    </Routes>
                </section>
            </main>
        </Router>
        {
            props.isListen &&
            (<Listen />)
        }
        </>
    )
}

export default Main;