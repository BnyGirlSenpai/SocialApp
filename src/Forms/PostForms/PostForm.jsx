import React from 'react'

const Post = () => {
  return (
    <div class="d-flex flex-column h-100 p-5 pb-3 text-shadow-1">
    <h3 class="pt-5 mt-5 mb-4 display-6 lh-1 fw-bold">Another longer title belongs here</h3>
    <ul class="d-flex list-unstyled mt-auto">
      <li class="me-auto">
        <img src="https://github.com/twbs.png" alt="Bootstrap" width="32" height="32" class="rounded-circle border border-white"/>
      </li>
      <li class="d-flex align-items-center me-3">
        <svg class="bi me-2" width="1em" height="1em"></svg>
        <small>California</small>
      </li>
      <li class="d-flex align-items-center">
        <svg class="bi me-2" width="1em" height="1em"></svg>
        <small>5d</small>
      </li>
    </ul>
  </div>
  )
}

export default Post