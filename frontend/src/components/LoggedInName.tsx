import pfp from '../images/pfp.png'

function LoggedInName() {
    var user = {}
    function doLogout(event: any): void {
        event.preventDefault();
        alert('doLogout');
    };
    return (
        <div className="loggedin-user" id="loggedInDiv">
            <img src={pfp} className='profile-pic' />
            <div>
                <span id="userName">John Doe</span><br />
                <button type="button" id="logoutButton" className="buttons"
                    onClick={doLogout}>Sign out</button>
            </div>
        </div>
    );
};
export default LoggedInName;

// function LoggedInName() {
//     var _ud = localStorage.getItem('user_data');
//     if (_ud == null) _ud = "";
//     var ud = JSON.parse(_ud);
//     var userId = ud.id;
//     var firstName = ud.firstName;
//     var lastName = ud.lastName;
//     function doLogout(event: any): void {
//         event.preventDefault();
//         localStorage.removeItem("user_data")
//         window.location.href = '/';
//     };
//     return (
//         <div id="loggedInDiv">
//             <span id="userName">{firstName} {lastName}</span><br />
//             <button type="button" id="logoutButton" className="buttons"
//                 onClick={doLogout}>Sign out</button>
//         </div>
//     );
// };
