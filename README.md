# Server
TECHNICAL GUIDE

This assignment haschosen the Option A as the final topic, in other words, these files intends tocreate a location-based quiz application which contains a Question-Setting App,a Quiz APP, and a NodeJS server. These parts are located in 3 repositories (QuestionSettingAPP, QuizAPP, and Server) respectively. This technical guide will help you understand and use these 2 apps and server.

1 QuestionSettingAPP 

The main body of this app is based on the practical 6 & 7 which guide students to create a uploadData.js & httpServer.js. The index.html file is also built on the practical in week2. When user try to run it, just use node httpServer.js & and then enter phonegap serve, a website with a map and user guide will show in a browser, like Picture 1. The navigation bar contains QuestionID, Question, 4Answers, Correct_Answer, coordinates, and Location Name. Just follow the userguide which layed on the bottom of the map to enter what you want (P.S. the Correct_Answer is referred to the ID of Answer (1,2,3,4) instead the content of the correct answer. The coordinates of test points can be extracted from https://itouchmap.com/latlong.html, user can also use this website to check and find the location they want.

PLEASE ATTENTION:
The results of the attempts at the beginning are very successful, but recently, the code cannot upload the question data sometimes, which means user may need to enter the coordinates manually once the app cannot upload. But this situation does not happen frequently.

2 QuizAPP 

After setting the question data, the quiz mapper could be started to track the movement of a user. The user guide will be shown at the beginning as long as the app is started. Just use phonegap serve to start it, the test result can be shown in a browser (both laptop and phone). The usersguide.html will also be run to help user to understand this app better. The radius of a track location in this app is set as 50m, in other words, the question will be displayed as long as a question point is within the 50m scope. User needs to select a answer from the 4 options and a response will be returned to tell user whether the selection is correct or not. Besides, based on the practical 1 which guides us to track user’s location and calculate distance, this app also contains these code in index.html. Therefore, the distance from current location to Warren Street Station can also be calculated as long as the button ”Calculate Distance” is clicked. Moreover, an alert will also be displayed when user attempt to click the question point which are outside the 50m radius.

PLEASE ATTENTION: 
Even though the location coordinates are usually extracted automatically through user’s phone with GPS, the situation that the location extracted is not correct or even does not exist often happen. In this app, user are allowed to click the point by themselves. The center of the 50m radius is the track location.

3 NodeJS Server 

This server is based on the httpServer.js which have been provided in the practical 5 and can be used to save the question date from question-setting app and send these questions to the quiz app when the app is launched. This file have been added in the
QuestionSettingAPP repository to collect the data. The code still need to be debugged.
