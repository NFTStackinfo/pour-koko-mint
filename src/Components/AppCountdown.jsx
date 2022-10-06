import Countdown from 'react-countdown'

import React, { useEffect } from 'react'

const Renderer = ({ days, hours, minutes, seconds, completed }) => {
  if (completed) {
    // Render a completed state
    return <span className="countdown-text">Time is up!</span>
  } else {
    // Render a countdown
    return <span className="countdown-text">
      {days ? days + ' days' : ''} {hours < 10 ? '0' + hours : hours}
      :{minutes < 10 ? '0' + minutes : minutes}
      :{seconds < 10 ? '0' + seconds : seconds}
    </span>
  }
}

const AppCountdown = ({ date, onComplete }) => {
  return (
    <Countdown date={date} renderer={Renderer} onComplete={onComplete} />
  )
}
export default AppCountdown
