// var perf = require('./index.html');

// class Index extends React.Component {
// 	render() {
// 		return (
// 			<iframe src={perf}></iframe>   /* like this */
// 		);
// 	}
// }
// export default Index;

import React from 'react';
function iframe() {
	return {
		__html: '<iframe src="/public/videoco.html" width="200" height="200"></iframe>'
	}
}


export default function Index() {
	return (
		<div>
			<div dangerouslySetInnerHTML={iframe()} />
		</div>)
}