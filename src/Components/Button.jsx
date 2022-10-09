import React from 'react'

const Button = ({ id = '', className = '', onClick, children }) => {
  return (
    <button
      className={['btn', className].join(' ')}
      id={id}
      onClick={onClick}
    >
      <span>{children}</span>
    </button>
  )
}

export default Button
