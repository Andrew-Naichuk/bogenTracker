// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const providerGoogle = new firebase.auth.GoogleAuthProvider();
const analytics = firebase.analytics();

// Auth status observer
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        getSessionsSnapshot();
        setTimeout(function(){
            sessionsSnapshot.forEach(session => {
                session.rounds.forEach(round => {
                    if (round.uid === window.location.search.replace('?','')) {
                        roundNameIndicator.innerText = round.time;
                    };
                });
            });
            getArrows();
        }, 400);
    } else {
        let redirectLocation = loadedLocation + '/app/signin.html'
        window.location.replace(redirectLocation);
    }
});


// Back to session functionality
backToSessionScreenButton.addEventListener('click', function(){
    arrowsListContainer.innerHTML = '';
    let redirectLocation;
    sessionsSnapshot.forEach(session => {
        session.rounds.forEach(round => {
            if (round.uid === window.location.search.replace('?','')) {
                redirectLocation = loadedLocation + '/app/session.html?' + session.uid;
            };
        });
    });
    window.location.href = redirectLocation;
});


// Read and Render Arrows From Database
async function getArrows(){
    const docRef = db.collection("btUsers").doc(auth.currentUser.uid);
    arrowsListContainer.innerHTML = '';
    // Trying to fetch data from the document
    const doc = await docRef.get();
    if (doc.exists) {
        sessionsSnapshot = doc.data().sessions;
        let list = doc.data().sessions;
        // Going through all sessions in search of the currently selected one
        list.forEach(session => {

            session.rounds.forEach(round => {
                if (round.uid === window.location.search.replace('?','')) {
                    // Rendering round comment if any
                    if (round.comment.length > 0) {
                        const roundRenderedComment = document.createElement("div");
                        roundRenderedComment.classList.add('sessionPageComment');
                        roundRenderedComment.classList.add('fadeIn');
                        roundRenderedComment.innerHTML = `
                            <h4>Round Notes:</h4>
                            <p>${round.comment}</p>
                        `;
                        arrowsListContainer.appendChild(roundRenderedComment);
                    };

                    // Rendering arrows of the selected round
                    let renderedArrowNumber = 1;
                    round.arrows.forEach(arrow => {
                        // Assigning color to the rendered item based on value
                        let arrowColor = 'white';
                        if (Number(arrow) === 3 || Number(arrow) === 4) {
                            arrowColor = 'black'
                        }
                        if (Number(arrow) === 5 || Number(arrow) === 6) {
                            arrowColor = 'blue'
                        }
                        if (Number(arrow) === 7 || Number(arrow) === 8) {
                            arrowColor = 'red'
                        }
                        if (Number(arrow) === 9 || Number(arrow) === 10) {
                            arrowColor = 'gold'
                        }
                        const renderedArrow = document.createElement("article");
                        renderedArrow.classList.add('fadeIn');
                        renderedArrow.innerHTML = `
                        <div class="articleRow">
                            <h5>Arrow ${renderedArrowNumber}</h5>
                            <h5 class="fix50 ${arrowColor}">${iconsBundle.target} ${arrow}</h5>
                        </div>
                        `;
                        arrowsListContainer.appendChild(renderedArrow);
                        renderedArrowNumber = renderedArrowNumber + 1
                    });
                };
            });
        });
    };
};


// Delete Round Functionality
// Open confirmation modal functionality
deleteRoundModalButton.addEventListener('click', function(){
    confirmDeleteRoundModal.classList.remove("hidden");
    confirmDeleteRoundModal.classList.add("fadeIn");
    confirmDeleteRoundModal.classList.add("visible");
});
// Close confirmation modal functionality (cancel delete)
cancelDeleteRoundButton.addEventListener('click', function(){
    confirmDeleteRoundModal.classList.remove("visible");
    confirmDeleteRoundModal.classList.remove("fadeIn");
    confirmDeleteRoundModal.classList.add("hidden");
});
// Delete round in DB
deleteRoundButton.addEventListener('click', function(){
    // Preparing updated session snapshot with new status of current round
    sessionsSnapshot.forEach(session => {
        session.rounds.forEach(round => {
            if (round.uid === window.location.search.replace('?','')) {
                round.status = 'deleted';
                // Asynchronous function for database operations
                (async function(){
                    try {
                        // Pushing updated session object to the DB by updating the sessions array field
                        await db.collection("btUsers").doc(auth.currentUser.uid).update({
                            sessions: sessionsSnapshot,
                        });
                    } catch (error) {
                        window.alert(error);
                    }
                })();
                // Navigating back and updating it
                confirmDeleteRoundModal.classList.remove("visible");
                confirmDeleteRoundModal.classList.remove("fadeIn");
                confirmDeleteRoundModal.classList.add("hidden");
                createToastMessage('success', 'Set deleted!')
                setTimeout(function(){let redirectLocation;
                    sessionsSnapshot.forEach(session => {
                        session.rounds.forEach(round => {
                            if (round.uid === window.location.search.replace('?','')) {
                                redirectLocation = loadedLocation + '/app/session.html?' + session.uid;
                            };
                        });
                    });
                    window.location.href = redirectLocation;
                }, 1000);
            };
        });
    });
});