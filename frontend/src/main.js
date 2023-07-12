// notice: 
//1,the last Interval is about the [2.6.3 push nofitication] feature,
//if anything keep popup [new job] just comment those lines



import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';

console.log('Let\'s go!');

let jobIndexDef = 0;
let jobPostNumDef = 0;
let commentShowDef = 3;


const showAndHide = (showElement,hideElement) => {

    document.getElementById(showElement).classList.remove("hide");
    document.getElementById(hideElement).classList.add("hide");
    
}


//communicate with the backend server via APIs
const apiCall = (path, method, payload,success) => {
    const options = {
        method: method,
        headers:{
            'Content-type': 'application/json',
        },
    };

    if(method === 'GET'){
        //come back to this
    }else{
        options.body = JSON.stringify(payload);
    }

    if(localStorage.getItem('token')){
        const tokenstr = localStorage.getItem('token');
        options.headers.Authorization = 'Bearer ' + tokenstr;
    }

    fetch('http://localhost:5005/' + path ,options)
    .then(response =>{
        return response.json()
    })
    .then((data) => {
        if (data.error){
            //alert(data.error);
            document.getElementById("errMsg").innerText = data.error+"!"
            document.getElementById("popup").classList.remove("hide");
        }else{
            if(success){
                //console.log("apiCall success the server responsed as:",data);
                success(data);
            }
        }
    })
    //return fetch;


};

const postLast = (postTime) => {
    const nowTime = new Date();
    const mlisecPerDay =24*3600*1000;
    if( (  (nowTime-postTime)/ mlisecPerDay) < 1 ){
        const postHours = Math.floor((nowTime-postTime)/(3600*1000));
        const postMins = Math.floor((nowTime-postTime)/(60*1000) - postHours*60);

        if(postHours === 0){
            if(postMins === 0){
                return "just released"
            }else{
                return + postMins + " mins ago"
            }
        }else{
            return + postHours + " hours " + postMins + " mins ago"
        }

    }else{
        let mm = postTime.getMonth() + 1;
        let dd = postTime.getDate();

        if(postTime.getMonth()<10){
            mm = '0' + mm;
        }
        if(postTime.getDate()<10){
            dd = '0' + dd;
        }
        return dd +'/'+ mm + '/' + postTime.getFullYear();
    }

};

const showOneComment =(commentUserId,commentText) =>{
    const oneComment = document.createElement('div');
    oneComment.style.display = 'flex';

    const commentByUser = document.createElement('p');

    commentByUser.addEventListener('click',()=>{
        showProfile();
    });

    commentByUser.classList.add('pointerButton');
    const comment = document.createElement('p');
    
    apiCall('user?userId='+commentUserId,'GET',{},(data)=>{  
        commentByUser.innerText = data.name;
    })
    
    comment.innerText = ':    '+commentText;
    oneComment.appendChild(commentByUser);
    oneComment.appendChild(comment);
    return oneComment;
}



//generate the job/feeds
const populateFeed =() =>{
    console.log("populatedFeed called!!!!!!!!!!!!!")
    apiCall('job/feed?start=0','GET',{},(data) =>{
        console.log("the job/feed data is",data)
        jobPostNumDef = data.length;

        for(let i = 0; i< jobPostNumDef; i++){
            localStorage.setItem('postJob' +i+ localStorage.getItem('userName'), data[i].id);
        }

        //console.log(jobPostNumDef);
        if(jobIndexDef ===0){
            document.getElementById('feed-items').innerText ='';
        }
        //if (document.getElementById('feed-items').childNodes.length===0){

        for(let jobIndex = jobIndexDef; jobIndex < data.length; jobIndex ++ ){
            //localStorage.setItem('postedLatestJob' + localStorage.getItem('userName'), data[0].id);
            //console.log('postedLatestJob + theUserName is', data[0].id)
            const feedJob = data[jobIndex];            

            console.log(feedJob);
            //console.log('testIndex is :',testIndex);
            console.log('jobIndex is :',jobIndex);
            //testIndex ++;

            const postTime = new Date(feedJob.createdAt);

            const oneJob = document.createElement('div');
            oneJob.setAttribute('id',feedJob.id);   
            oneJob.classList.add('jobPart');
            document.getElementById("feed-items").appendChild(oneJob);


            //show the icon of the user
            


            const jobCreatorName = document.createElement('p');

            apiCall('user?userId='+feedJob.creatorId,'GET',{},(data)=>{  
                jobCreatorName.innerText = 'job Creator: ' + data.name ;
            })
            oneJob.appendChild(jobCreatorName);

            if(feedJob.image !== undefined){
                const jobImage = document.createElement("img");
                jobImage.src = feedJob.image;
                if(window.innerWidth>700){
                    jobImage.style.width = "500px";
                }else if(window.innerWidth>300){
                    jobImage.style.width = (window.innerWidth *0.6 )+"px" ;
                }else{
                    jobImage.style.width = (window.innerWidth *0.4 )+"px" ;
                }
                oneJob.appendChild(jobImage);
            }

            const JobInfo = document.createElement('p');
            JobInfo.innerText = "job title: " + feedJob.title + 
                                "\njob Posted: " + postLast(postTime) +
                                "\njob Started At: " + feedJob.start +
                                "\njob description: " + feedJob.description;

            
            oneJob.appendChild(JobInfo);

            
            const jobLikeCounter = document.createElement('p');
            jobLikeCounter.setAttribute('id',feedJob.id + 'jobLikeCounter');
            jobLikeCounter.innerText = 'Job likes:' + feedJob.likes.length;
            oneJob.appendChild(jobLikeCounter);



            const jobLikedDiv = document.createElement('div');
            jobLikedDiv.style.margin ="0px 0px 10px 0px";
            oneJob.appendChild(jobLikedDiv);


            //[like this job] button               
            const jobLikeButton = document.createElement('button');
            jobLikeButton.innerText = "Like this job";
            oneJob.appendChild(jobLikeButton);

            const payload = {
                id: feedJob.id,
                turnon: "true",
            }
            jobLikeButton.addEventListener('click',()=>{
                apiCall('job/like','PUT',payload,(data)=>{
                })
                let alreadyLiked = 0;
                for(let i = 0; i<feedJob.likes.length;i++){
                    if(feedJob.likes[i].userId === parseInt (localStorage.getItem('userId'))){
                        alreadyLiked = 1;
                    }
                }
                if(!alreadyLiked){
                    jobLikeCounter.innerText = 'Job likes:' + (feedJob.likes.length+1);


                    const addJobLiked = document.createElement('p');
                    addJobLiked.innerText = "This job liked by: " 
                    jobLikedDiv.appendChild(addJobLiked);
                    
                    const addJobLikedBy = document.createElement('button');
                    addJobLikedBy.innerText = localStorage.getItem('userName');
                    addJobLikedBy.addEventListener('click',()=>{
                        const userId = localStorage.getItem('userId');
                        apiCall('user?userId='+userId,'GET',{}, (data) =>{
                            populateProfile(data);
                        });
                        //show the "update" button
                        document.getElementById("profile-update").classList.remove("hide");
                        //hide the "watch" button to avoid watching self
                        document.getElementById("watch-unwatch").classList.add("hide"); 
                        showAndHide("section-profile","section-logged-in");
                        
                    })

                    jobLikedDiv.appendChild(addJobLikedBy);
                    //alreadyLiked = 1;
                }

            },{once:true})


            //list of users who like this job
            if(feedJob.likes.length > 0){
                
                const jobLiked = document.createElement('p');
                jobLiked.innerText = "This job liked by: " 
                jobLikedDiv.appendChild(jobLiked);

                for(let i = 0; i<feedJob.likes.length; i++){
                    //console.log("set the likes nav to:",i, "   ",feedJob.likes[i].userId);
                    const jobLikedBy = document.createElement('button');
                    apiCall('user?userId='+feedJob.likes[i].userId,'GET',{}, (data) =>{
                        jobLikedBy.innerText = data.name;
                    });
                    jobLikedDiv.appendChild(jobLikedBy);

                    jobLikedBy.addEventListener('click',()=>{
                        apiCall('user?userId='+feedJob.likes[i].userId,'GET',{}, (data) =>{
                            populateProfile(data);
                            showAndHide("section-profile","section-logged-in");
                            //hide the "update" button
                            document.getElementById("profile-update").classList.add("hide");
                            //show the "watch/unwatch" button
                            const userId = localStorage.getItem('userId');
                            if(userId!=feedJob.likes[i].userId){
                                document.getElementById("watch-unwatch").classList.remove("hide");
                                if(data.watcheeUserIds.indexOf(userId)){
                                    document.getElementById("watch-unwatch").innerText="unwatch";
                                }else{
                                    document.getElementById("watch-unwatch").innerText="watch";
                                }
                            }
                            document.getElementById("watch-unwatch").addEventListener("click",()=>{
                                if(document.getElementById("watch-unwatch").innerText=="watch"){
                                    document.getElementById("watch-unwatch").innerText="unwatch";  
                                    const payload = {
                                        email: feedJob.likes[i].userEmail,
                                        turnon: true
                                    }
                                    apiCall('user/watch','PUT',payload);
                                }else{
                                    document.getElementById("watch-unwatch").innerText="watch";
                                    const payload = {
                                        email: feedJob.likes[i].userEmail,
                                        turnon: false
                                    }
                                    apiCall('user/watch','PUT',payload);
                                }
                                    
                            });
                        }); 
                        
                    })

                }

            }

       
            //comment related features
            const jobNoOfComments = document.createElement('p');
            let commentNum = feedJob.comments.length;
            jobNoOfComments.innerText = "number of comments: " + feedJob.comments.length;
            oneJob.appendChild(jobNoOfComments);



            //list all comments
            let commentShowCountDown = commentShowDef;
            const lessCommentsPart = document.createElement('div');
            lessCommentsPart.classList.add("commentPart");

            for(let i = feedJob.comments.length-1; i>=0 ; i-- ){

                const oneComment = showOneComment(feedJob.comments[i].userId,feedJob.comments[i].comment);

                lessCommentsPart.appendChild(oneComment);
    
                commentShowCountDown --;
                if(commentShowCountDown === 0){
                    break;
                }  
                       
            }
            oneJob.appendChild(lessCommentsPart);



            const moreCommentsPart = document.createElement('div');
            moreCommentsPart.classList.add("commentPart");
            for(let i = feedJob.comments.length-1; i>=0  ; i-- ){
                const oneComment = showOneComment(feedJob.comments[i].userId,feedJob.comments[i].comment);
                moreCommentsPart.appendChild(oneComment);                
            }
            moreCommentsPart.classList.add('hide');
            oneJob.appendChild(moreCommentsPart);


            if(feedJob.comments.length>commentShowDef){
                const moreCommentButton = document.createElement('button');
                moreCommentButton.innerText = "⬇more comments⬇";    
                moreCommentButton.addEventListener('click',()=>{
                    lessCommentsPart.classList.add('hide');
                    moreCommentsPart.classList.remove('hide');
                });
                lessCommentsPart.appendChild(moreCommentButton);


                const lessCommentButton = document.createElement('button');
                lessCommentButton.innerText = "⬆less comments⬆";
                lessCommentButton.addEventListener('click',()=>{
                    lessCommentsPart.classList.remove('hide');
                    moreCommentsPart.classList.add('hide');
                    
                });
                moreCommentsPart.appendChild(lessCommentButton);
            }




            
            //make a comments button
            const makeComment = document.createElement('button');
            makeComment.innerText = 'make a comment';
            oneJob.appendChild(makeComment);


            // make a comments input area
            const jobCommentInput = document.createElement('textarea');
            jobCommentInput.rows ="6";

            if(window.innerWidth>700){
                jobCommentInput.cols ="40";
            }else if(window.innerWidth>400){
                jobCommentInput.cols ="30";
            }else if(window.innerWidth>300){
                jobCommentInput.cols ="20"; 
            }else{
                jobCommentInput.cols ="10";
            }

        
            jobCommentInput.classList.add('hide');
            oneJob.appendChild(jobCommentInput);

            makeComment.addEventListener('click',()=>{ 
                jobCommentInput.value ='';                  
                makeComment.classList.add('hide');
                jobCommentInput.classList.remove('hide');
                jobCommentSubmitButton.classList.remove('hide');
                jobCommentCancelButton.classList.remove('hide');
            })


            //submit button of comment
            const jobCommentSubmitButton =document.createElement('button');
            jobCommentSubmitButton.setAttribute('id',feedJob.id+':'+ 'jobCommentSubmitButton');

            jobCommentSubmitButton.innerText ='submit';
            jobCommentSubmitButton.classList.add('hide');
            oneJob.appendChild(jobCommentSubmitButton);

            jobCommentSubmitButton.addEventListener('click',()=>{ 
                //console.log('the jobCommentsInput.value.length is:',jobCommentInput.value.length);
                if(jobCommentInput.value.length!==0){
                    const payload ={
                        id: feedJob.id,
                        comment: jobCommentInput.value,
                    }
                    apiCall('job/comment','POST',payload,(data)=>{
                        console.log('adding comment success')
                    })
                }
                makeComment.classList.remove('hide');
                jobCommentInput.classList.add('hide');
                jobCommentSubmitButton.classList.add('hide');
                jobCommentCancelButton.classList.add('hide');

                //console.log("the lessCommentsPart.children.length is:",lessCommentsPart.children.length)
                

                console.log('lessCommentsPart.children',lessCommentsPart.children)
                console.log('lessCommentsPart.children.length',lessCommentsPart.children.length)
                console.log('commentShowDef',commentShowDef);
                
                if(lessCommentsPart.children.length===commentShowDef){
                    lessCommentsPart.removeChild(lessCommentsPart.lastChild);
                    const moreCommentButton = document.createElement('button');
                    moreCommentButton.innerText = "⬇more comments⬇";    
                    moreCommentButton.addEventListener('click',()=>{
                        lessCommentsPart.classList.add('hide');
                        moreCommentsPart.classList.remove('hide');
                    });
                    lessCommentsPart.appendChild(moreCommentButton);
    
    
                    const lessCommentButton = document.createElement('button');
                    lessCommentButton.innerText = "⬆less comments⬆";
                    lessCommentButton.addEventListener('click',()=>{
                        lessCommentsPart.classList.remove('hide');
                        moreCommentsPart.classList.add('hide');
                        
                    });
                    moreCommentsPart.appendChild(lessCommentButton);
                    //moreCommentsPart.removeChild(moreCommentsPart.lastChild);
                }

                if(lessCommentsPart.children.length>commentShowDef){
                    lessCommentsPart.removeChild(lessCommentsPart.lastChild.previousSibling);
                    console.log("YEEEEEHHHHHHHH!!!!!!")
                    
                }

                const addOneComment = showOneComment(localStorage.getItem('userId'),jobCommentInput.value);
                const addOneComment2 = showOneComment(localStorage.getItem('userId'),jobCommentInput.value);

                if(lessCommentsPart.firstChild){
                    lessCommentsPart.insertBefore(addOneComment,lessCommentsPart.firstChild);
                    moreCommentsPart.insertBefore(addOneComment2,moreCommentsPart.firstChild);
                }else{
                    lessCommentsPart.appendChild(addOneComment)
                    moreCommentsPart.appendChild(addOneComment2)
                }


                commentNum = commentNum + 1;
                jobNoOfComments.innerText = "number of comments: " + commentNum;
                

            })

            //job comments cancel button//
            const jobCommentCancelButton =document.createElement('button');
            jobCommentCancelButton.innerText ='cancel';
            jobCommentCancelButton.classList.add('hide');
            oneJob.appendChild(jobCommentCancelButton);

            jobCommentCancelButton.addEventListener('click',()=>{

                makeComment.classList.remove('hide');
                jobCommentInput.classList.add('hide');
                jobCommentSubmitButton.classList.add('hide');
                jobCommentCancelButton.classList.add('hide');


            })

                 
            if(document.getElementById("feed-items").offsetHeight> 500 ){
                jobIndexDef = jobIndex + 1;
                break

            }
            
        }
        
        //}

        //console.log('data', data);
    })

}



//save the token and userId locally for furture use
const setToken =(data) => {
    localStorage.setItem('token',data.token);
    localStorage.setItem('userId',data.userId);

    console.log("the token is stored:",data.token);
    console.log("the userId is stored:",data.userId);

    apiCall('user?userId='+data.userId,'GET',{}, (data) =>{
        localStorage.setItem('userName',data.name);
        console.log("the userName is stored:",data.name);
        document.getElementById("hiUser").innerText = 'Hi '+data.name+' :)';
    });


    showAndHide("section-logged-in","section-logged-out");
    populateFeed();
}

const populateProfile =(data) =>{

    console.log("the User profile is",data);
    let userData = JSON.parse(JSON.stringify(data));  
    document.getElementById("uId").textContent = userData.id;
    document.getElementById("uName").textContent = userData.name;
    document.getElementById("uEmail").textContent = userData.email;
    document.getElementById("WatchList").textContent = '';
    for(let i=0;i<userData.watcheeUserIds.length;i++){
        apiCall('user?userId='+userData.watcheeUserIds[i],'GET',{}, (data) =>{
            let userData = JSON.parse(JSON.stringify(data));
            document.getElementById("WatchList").textContent += userData.name+ ' ';
        });
    }
    document.getElementById("WatchedNum").textContent = userData.watcheeUserIds.length;
    if(userData.image!=undefined){
        document.getElementById("pImage").src = userData.image;
        document.getElementById("pImage").style.width = '100px';
        document.getElementById("pImage").classList.remove("hide");
    }
    
    document.getElementById("uJobs").textContent = "";
    for(let i=0; i<userData.jobs.length; i++){
        //generate 'delete' job button
        let deleteJob = document.createElement('button');
        deleteJob.textContent = 'delete';
        deleteJob.id = "deleteJob"+i;
        document.getElementById("uJobs").appendChild(deleteJob);
        document.getElementById("deleteJob"+i).addEventListener('click',()=>{
            //console.log(userData.jobs[i].id);
            const payload = {
                id: userData.jobs[i].id,
            }
            apiCall('job','DELETE',payload);
            const userId = localStorage.getItem('userId');
            apiCall('user?userId='+userId,'GET',{}, (data) =>{
                populateProfile(data);
            });
        });
        //generate 'update' job button
        let updateJob = document.createElement('button');
        updateJob.textContent = 'update';
        updateJob.id = "updateJob"+i;
        document.getElementById("uJobs").appendChild(updateJob);
        document.getElementById("updateJob"+i).addEventListener('click',()=>{
            showAndHide("section-job-update","section-profile");
            document.getElementById("update-job-title").value = userData.jobs[i].title;
            document.getElementById("update-job-description").value = userData.jobs[i].description;
            document.getElementById("update-job").addEventListener("click",()=>{
                console.log(userData.jobs[i].id);
                console.log(userData);
                const file = document.getElementById("update-job-image").files[0];
                if(file!=undefined){
                    fileToDataUrl(file).then((fileUrl)=>{
                    const payload = {
                        id: userData.jobs[i].id,
                        title: document.getElementById("update-job-title").value,
                        description: document.getElementById("update-job-description").value,
                        image: fileUrl,
                    }
                    apiCall('job','PUT', payload);
                    console.log(userData.jobs[i].title);
                    })
                }else{
                    const payload = {
                        id: userData.jobs[i].id,
                        title: document.getElementById("update-job-title").value,
                        description: document.getElementById("update-job-description").value,
                        }
                    apiCall('job','PUT',payload);
                }
                
                const userId = localStorage.getItem('userId');
                apiCall('user?userId='+userId,'GET',{}, (data) =>{
                    populateProfile(data);
                });
                showAndHide("section-profile","section-job-update");
            })
        });
        //generate jobs' contents
        let userJob = "Job Title: "+ userData.jobs[i].title +
                    "\nJob Creator: " + userData.jobs[i].creatorId +
                    "\nJob Posted: "+ userData.jobs[i].createdAt.substring(0,10)+
                    "\nJob Started At: " + userData.jobs[i].start + 
                    "\nJob Description: " + userData.jobs[i].description;
        let aJob = document.createElement('p');
        aJob.textContent = userJob;
        document.getElementById("uJobs").appendChild(aJob);
        if(userData.jobs[i].image!=undefined){
            let JobImage = document.createElement('img');
            JobImage.src = userData.jobs[i].image;
            //JobImage.classList.add('images');
            if(window.innerWidth>700){
                JobImage.style.width = "500px";
            }else if(window.innerWidth>300){
                JobImage.style.width = (window.innerWidth *0.6 )+"px" ;
            }else{
                JobImage.style.width = (window.innerWidth *0.4 )+"px" ;
            }


            document.getElementById("uJobs").appendChild(JobImage);
        }
        let line = document.createElement('p');
        line.textContent = "---------------------"
        document.getElementById("uJobs").appendChild(line);
    }

}



//triggers for fetching info from backend

//personal profile page

const showProfile = ()=>{
    const userId = localStorage.getItem('userId');
    apiCall('user?userId='+userId,'GET',{}, (data) =>{
        populateProfile(data);
    });
    //show the "update" button
    document.getElementById("profile-update").classList.remove("hide");
    //hide the "watch" button to avoid watching self
    document.getElementById("watch-unwatch").classList.add("hide");  
    
    showAndHide("section-profile","section-logged-in");
}



document.getElementById("personal-profile").addEventListener("click", ()=>{
    showProfile();
});



document.getElementById("register-button").addEventListener("click",()=>{
    if (document.getElementById("register-password").value === document.getElementById("register-password-check").value){
        const payload = {
            email: document.getElementById("register-email").value,
            password: document.getElementById("register-password").value,
            name: document.getElementById("register-name").value,
        }
        
        apiCall("auth/register",'POST',payload, (data)=>{
            setToken(data);
        });    
    }else{
        alert("passwords are different!");
    }       

})


document.getElementById("login-button").addEventListener("click",()=>{
    const payload = {
        email: document.getElementById("login-email").value,
        password:  document.getElementById("login-password").value,
    }
    apiCall("auth/login",'POST',payload,(data) => {
        setToken(data);
    });
    
})

document.getElementById("button-create-job").addEventListener("click",()=>{
    
    const file = document.getElementById("job-image").files[0];
    
    console.log("file",file);
    if(file ===undefined){
  
        const payload = {
            title: document.getElementById("job-title").value,
            image: "",
            start: "2011-10-05T14:48:00.000Z",
            description: document.getElementById("job-description").value,
        }
        apiCall("job",'POST',payload,(data)=>{
            jobIndexDef = 0;
            populateFeed();
        });
        
    }else{
        fileToDataUrl(file).then((fileUrl)=>{
            const nowTime = new Date();
            const payload = {
                title: document.getElementById("job-title").value,
                image: fileUrl,
                start: nowTime,
                description: document.getElementById("job-description").value,
            }
            apiCall("job",'POST',payload,(data)=>{
                jobIndexDef = 0;
                populateFeed();
            });
        })

    }
    showAndHide("section-logged-in","section-create-job");

})

document.getElementById("update-button").addEventListener("click",()=>{
    const ob = document.getElementById("update-image");
    console.log('the object is:',ob);
    const file = document.getElementById("update-image").files[0];
    console.log('file is',file)
    if(file!=undefined){
        fileToDataUrl(file).then((fileUrl)=>{
        const payload = {
            email: document.getElementById("update-email").value,
            password: document.getElementById("update-password").value,
            name: document.getElementById("update-name").value,
            image: fileUrl,
        }
        apiCall('user','PUT',payload);
    })
    }else{
        const payload = {
            email: document.getElementById("update-email").value,
            password: document.getElementById("update-password").value,
            name: document.getElementById("update-name").value,
        }
        apiCall('user','PUT',payload);
    }
    
    const userId = localStorage.getItem('userId');
    apiCall('user?userId='+userId,'GET',{}, (data) =>{
        populateProfile(data);
    });
    showAndHide("section-profile","section-profile-update");
})


//button event listeners
document.getElementById("nav-register").addEventListener("click",()=>{
    showAndHide("page-register","page-login");
});

document.getElementById("nav-login").addEventListener("click",()=>{
    showAndHide("page-login","page-register");

});

document.getElementById("post-job").addEventListener('click',()=>{
    showAndHide("section-create-job","section-logged-in");
})


document.getElementById("button-create-job-cancel").addEventListener('click',()=>{
    showAndHide("section-logged-in","section-create-job");
    jobIndexDef = 0;
    populateFeed();

})

document.getElementById("logout").addEventListener('click',()=>{
    showAndHide("section-logged-out","section-logged-in");
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('postedLatestJob' + localStorage.getItem('userName'))
})

document.getElementById("profile-back").addEventListener('click',()=>{
    showAndHide("section-logged-in","section-profile");
    jobIndexDef = 0;
    populateFeed();
});
document.getElementById("profile-back1").addEventListener('click',()=>{
    showAndHide("section-logged-in","section-profile");
    jobIndexDef = 0;
    populateFeed();
});

//from profile page to profile updating page
document.getElementById("profile-update").addEventListener('click',()=>{
    showAndHide("section-profile-update","section-profile");
    const userId = localStorage.getItem('userId');
    apiCall('user?userId='+userId,'GET',{}, (data) =>{
        let userData = JSON.parse(JSON.stringify(data));
        document.getElementById("update-email").value = userData.email;
        document.getElementById("update-name").value = userData.name;
    });
});
document.getElementById("profile-update-back").addEventListener('click',()=>{
    showAndHide("section-profile","section-profile-update");
});

document.getElementById("search").addEventListener('click',()=>{
    let emailS = prompt("Please enter the user's email to watch him/her:");
    if(emailS!=null && emailS!=""){
        const payload = {
        email: emailS,
        turnon: true
    }
    apiCall('user/watch','PUT',payload);
    }
    
});

document.getElementById("close-popup").addEventListener('click',()=>{
    document.getElementById("popup").classList.add('hide');
});

document.getElementById("job-update-back").addEventListener('click',()=>{
    showAndHide("section-profile","section-job-update");
});


document.getElementById('dark-mode').addEventListener('click',()=>{
    document.getElementById('wholePage').style.background ="#625939";
    showAndHide("light-mode","dark-mode");

});

document.getElementById('light-mode').addEventListener('click',()=>{
    document.getElementById('wholePage').style.background ="#fee600";
    showAndHide("dark-mode","light-mode");
});


//document.getElementsByClassName("keepFront").style.position='fixed';
window.addEventListener("scroll", () => {

        if(localStorage.getItem('token')){
            let scroll = window.scrollY;

            if(scroll>185){
                document.getElementById("keepFront").classList.add('float');
            }else{
                document.getElementById("keepFront").classList.remove('float');
            }
            if(document.body.scrollHeight - window.innerHeight-scroll<50 ){
                populateFeed();

        }

    }
});




//the default page 
if(localStorage.getItem('token')){
    const userPhoto = document.createElement('img');
    const userId = localStorage.getItem('userId');
    userPhoto.style.width = "40px";
    showAndHide(["section-logged-in"],["section-logged-out"]);
    populateFeed();
    console.log(localStorage.getItem('token'));
    document.getElementById("hiUser").innerText = 'Hi '+localStorage.getItem('userName')+' :)';

}



const jobCheckInterval =  setInterval(()=> {
    
    if(localStorage.getItem('token')){
        //console.log('checked the token, interval is running')
        apiCall('job/feed?start=0','GET',{},(data) =>{
            //console.log("[in the interval] the data from the API is :",data)
            let matched = 0;
            if(data.length!== 0 ){
                for(let i=0; i<jobPostNumDef; i++){
                    //console.log("the job id",localStorage.getItem('postJob' +i+ localStorage.getItem('userName')))
                    //console.log('the latest job from the api is :',data[0].id)
                    if(localStorage.getItem('postJob' +i+ localStorage.getItem('userName'))=== data[0].id ){
                        matched = 1;
                        //console.log("matched!!");
                    }
                }
                //console.log('--------------------')
                
                //console.log("[setInterval] the job/feed latest jobId is",data[0].id)
                //const postedLatestJob = localStorage.getItem('postedLatestJob' + localStorage.getItem('userName'));
                //console.log("[setInterval] the posted latest job Id is: ",postedLatestJob);
                if(matched === 0 ){
                    //console.log("no match!!!")
                    document.getElementById("errMsg").innerText = "new job posted!"
                    document.getElementById("popup").classList.remove("hide");
                    localStorage.setItem('postJob' +jobPostNumDef+ localStorage.getItem('userName'), data[0].id);
                    jobPostNumDef = jobPostNumDef + 1;
                    //localStorage.setItem('postedLatestJob' + localStorage.getItem('userName'),data[0].id)
                }   
            }    

        })
        
    }
}, 1000);  

