import React from 'react'
import '../styles/profile.css';

const Profile = () => {

  return (
 
<div class="container">
<div id="user-profile-2" class="user-profile">
    <div class="tabbable">
      <ul class="nav nav-tabs padding-18">
        <li class="active">
          <a data-toggle="tab" href="#home">
            <i class="green ace-icon fa fa-user bigger-120"></i>
            Profile
          </a>
        </li>

        <li>
          <a data-toggle="tab" href="#feed">
            <i class="orange ace-icon fa fa-rss bigger-120"></i>
            Activity Feed
          </a>
        </li>

        <li>
          <a data-toggle="tab" href="#friends">
            <i class="blue ace-icon fa fa-users bigger-120"></i>
            Friends
          </a>
        </li>

        <li>
          <a data-toggle="tab" href="#pictures">
            <i class="pink ace-icon fa fa-picture-o bigger-120"></i>
            Pictures
          </a>
        </li>
      </ul>

      <div class="tab-content no-border padding-24">
        <div id="home" class="tab-pane in active">
          <div class="row">
            <div class="col-xs-12 col-sm-3 center">
              <span class="profile-picture">
                <img class="editable img-responsive" alt=" Avatar" id="avatar2" src=""/>
              </span>

              <div class="space space-4"></div>

              <a href="#" class="btn btn-sm btn-block btn-success">
                <i class="ace-icon fa fa-plus-circle bigger-120"></i>
                <span class="bigger-110">Add as a friend</span>
              </a>

              <a href="#" class="btn btn-sm btn-block btn-primary">
                <i class="ace-icon fa fa-envelope-o bigger-110"></i>
                <span class="bigger-110">Send a message</span>
              </a>
            </div>

            <div class="col-xs-12 col-sm-9">
              <h4 class="blue">
                <span class="middle">John Doe</span>

                <span class="label label-purple arrowed-in-right">
                  <i class="ace-icon fa fa-circle smaller-80 align-middle"></i>
                  online
                </span>
              </h4>

              <div class="profile-user-info">
                <div class="profile-info-row">
                  <div class="profile-info-name"> Username </div>

                  <div class="profile-info-value">
                    <span>alexdoe</span>
                  </div>
                </div>

                <div class="profile-info-row">
                  <div class="profile-info-name"> Location </div>

                  <div class="profile-info-value">
                    <i class="fa fa-map-marker light-orange bigger-110"></i>
                    <span>Netherlands</span>
                    <span>Amsterdam</span>
                  </div>
                </div>

                <div class="profile-info-row">
                  <div class="profile-info-name"> Age </div>

                  <div class="profile-info-value">
                    <span>38</span>
                  </div>
                </div>

                <div class="profile-info-row">
                  <div class="profile-info-name"> Joined </div>

                  <div class="profile-info-value">
                    <span>2010/06/20</span>
                  </div>
                </div>

                <div class="profile-info-row">
                  <div class="profile-info-name"> Last Online </div>

                  <div class="profile-info-value">
                    <span>3 hours ago</span>
                  </div>
                </div>
              </div>

              <div class="hr hr-8 dotted"></div>

             
            </div>
          </div>

          <div class="space-20"></div>

          <div class="row">
            <div class="col-xs-12 col-sm-6">
              <div class="widget-box transparent">
                <div class="widget-header widget-header-small">
                  <h4 class="widget-title smaller">
                    <i class="ace-icon fa fa-check-square-o bigger-110"></i>
                    Little About Me
                  </h4>
                </div>

                <div class="widget-body">
                  <div class="widget-main">
                    <p>
                      My job is mostly lorem ipsuming and dolor sit ameting as long as consectetur adipiscing elit.
                    </p>
                    <p>
                      Sometimes quisque commodo massa gets in the way and sed ipsum porttitor facilisis.
                    </p>
                    <p>
                      The best thing about my job is that vestibulum id ligula porta felis euismod and nullam quis risus eget urna mollis ornare.
                    </p>
                    <p>
                      Thanks for visiting my profile.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
  )
}

export default Profile