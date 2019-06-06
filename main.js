var db = JSON.parse(sb);

function setUpBoard(new_user) {
	db.cur_user = new_user;
	db.cur_board = db.users[db.cur_user].classes[0];

	var un_div = document.getElementById('un');
	un_div.innerHTML = db.cur_user;

	var class_list = db.users[db.cur_user].classes;

	var i = 0;
	class_list.forEach(function(elem) {
		var elem_name = "cl" + i;
		var elem_div = document.getElementById(elem_name);
		elem_div.innerHTML = elem;
		i++;
	});

	changeBoard(db.cur_board);
}

function changeBoard(new_board) {
	db.cur_board = new_board;

	// Modify buttons
	var class_list = db.users[db.cur_user].classes;

	var i = 0;
	class_list.forEach(function(elem) {
		var elem_name = "cl" + i;
		var elem_div = document.getElementById(elem_name);
		if(elem == new_board) {
			elem_div.classList.add('class-list-hl');
		} else {
			if (elem_div.classList.contains('class-list-hl')) {
				elem_div.classList.remove('class-list-hl');
			}
		}
		i++;
	});

	displayPosts(db.boards[db.cur_board]);
}

function displayPosts(posts) {

	//console.log("Entered DP");
	var old_posts = document.getElementById("board");
	var new_posts = document.createElement('div');
	new_posts.id = 'board';

	//console.log(new_posts);

	var post_page = document.getElementById('page')
	post_page.replaceChild(new_posts,old_posts);

	dPhelper(posts, new_posts, 0);

	//console.log(new_posts);

	//console.log("Finished DP")
}

function dPhelper(post_list, new_board, post_lev) {
	//console.log("Entered DP-H");
	//console.log(post_list);

	var post_list = sortPostList(post_list, post_lev);

	var key_list = Object.keys(post_list);
	//console.log(key_list);
	for(var post = 0; post < key_list.length; post++) {
		//console.log(post);
		var key = key_list[post];
		//console.log(key);
		var post_div = document.createElement('div');
		post_div.setAttribute("class","post");
		var indent = post_list[key].level * 20;
		var css_indent = indent.toString() + "px";
		post_div.style.marginLeft = css_indent;

		if(post_list[key].newPost) {
			//console.log("DPH: Rendering new " + key);
			var contents = `<p class='post-un'>${db.cur_user}</p>
							<form id='reply-form'>
								<input id='reply-text' type="text">
								<div class='post-nav'>
								<p class='post-date'>${post_list[key].time}</p>
									<button type="button" id='post-submit' onclick='submitPost("${key}")'>Submit</button>
								</div>
							</form>
							`;

			post_div.innerHTML = contents;
			new_board.appendChild(post_div);

			//document.getElementById('post-submit').addEventListener('onclick',);
		} else {
			//console.log("DPH: Rendering old " + key);
			//console.log(post_list);
			var contents = `<p class='post-un'>${post_list[key].user}</p>
							<p class='post-text'>${post_list[key].text}</p>
							<div class='post-nav'>
								<p class='post-date'>${post_list[key].time}</p>
								<button type='button' class='post-reply'
									onclick='createPost("${key}")'>Reply</button>
							</div>`;

			//console.log(contents)
			post_div.innerHTML = contents;
			new_board.appendChild(post_div);

			if(Object.keys(post_list[key].replies).length != 0) {
				//console.log("DPH: Recursing into replies of " + key);
				dPhelper(post_list[key].replies, new_board, post_lev + 1);
			}
			//console.log("DPH: Finished with " + key);
		}
	}

}

function Post(user_inp, time_inp, irt_inp, level_inp, newPost_inp, text_inp, replies_inp) {
	this.user = user_inp;
	this.time = time_inp;
	this.irt = irt_inp;
	this.level = level_inp;
	this.newPost = newPost_inp;
	this.text = text_inp;
	this.replies = replies_inp;
}

function createPost(post_num) {

	//console.log("Entered createPost " + post_num);

	var posts = db.boards[db.cur_board];

	posts = modifyPost(posts, post_num, 0);

	//console.log("Finished final modifyPost");

	//console.log(posts);

	db.boards[db.cur_board] = posts;

	displayPosts(posts);

	//console.log("Finished createPost " + post_num);
}

function modifyPost(post_list, post_num, post_lev) {
	//console.log("Entered modifyPost: " + post_num);
	//console.log(post_list);

	var post_list = sortPostList(post_list, post_lev);

	var key_list = Object.keys(post_list);
	//console.log("Beginning iteration through all keys");
	for(var post = 0; post < key_list.length; post++) {
		var key = key_list[post];
		//console.log("MP: Start " + key);
		if(key == post_num) {
			//console.log("Found post " + key);
			//console.log(post_list);

			var d = new Date();

			var post_id = "post_" + d.getUTCFullYear() + "_" + (d.getUTCMonth() + 1).toString() + "_" + d.getUTCDate() + "_" + d.getUTCHours() + "_" + d.getUTCMinutes() + "_" + d.getUTCSeconds() + "_" + (db.cur_user).toString();
			var dateOptions = {month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'};
			var post_time = d.toLocaleDateString('en-US', dateOptions);
			var post_level = (parseInt(post_list[key].level) + 1).toString();

			//console.log(post_id);

			post_list[key].replies[post_id] = new Post(db.cur_user, post_time, key, post_level, true, null, {});

			//console.log("Finished adding new post")
			//console.log(post_list);
			return post_list;
		}
		//console.log(post_list[key].replies);
		if(post_list[key] != undefined) {
			if(Object.keys(post_list[key].replies).length != 0) {
				//console.log("MP: Visiting replies for " + key );
				post_list[key].replies = modifyPost(post_list[key].replies, post_num, post_lev + 1);
			}
		}
		//console.log("MP: Finish " + key);
	}
	return post_list;
}

function submitPost(post_num) {

	//console.log("Entered submitPost " + post_num);

	var posts = db.boards[db.cur_board];

	posts = submitPostHelper(posts, post_num, 0);

	//console.log("Finished final submitPostHelper " + post_num);

	db.boards[db.cur_board] = posts;

	displayPosts(posts);

	//console.log("Finished submitPost " + post_num);
}

function submitPostHelper(post_list, post_num, post_lev) {

	//console.log("Entered submitPostHelper: " + post_num)

	post_list = sortPostList(post_list, post_lev);

	var key_list = Object.keys(post_list);
	for(var post = 0; post < key_list.length; post++) {
		key = key_list[post];
		//console.log("SPH: Start " + key);
		if(key == post_num) {
			//console.log("SPH: Found " + key);
			//console.log(post_list);

			var reply_text = document.getElementById('reply-text').value;

			var d = new Date();

			var dateOptions = {month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'};
			var post_time = d.toLocaleDateString('en-US', dateOptions);

			post_list[key].time = post_time;
			post_list[key].newPost = false;
			post_list[key].text = reply_text;
			//console.log("SPH: Finished adding new post" + key)
			//console.log(post_list);
			return post_list;
		}
		//console.log(post_list[key].replies);
		if(post_list[key] != undefined) {
			if(Object.keys(post_list[key].replies).length != 0) {
				//console.log("SPH: Visiting replies for " + key)
				post_list[key].replies = submitPostHelper(post_list[key].replies, post_num, post_lev + 1);
			}
		}
		//console.log("SPH: Finish " + key);
	}
	return post_list;
}

function sortPostList(post_list, level) {

	var key_list = Object.keys(post_list);

	new_post_list = {}

	if(level == 0) {
		key_list.sort( (a,b) => reverseAlphabeticalSort(a,b)).forEach(function(key) {
			new_post_list[key] = post_list[key];
		});
	} else {
		key_list.sort( (a,b) => alphabeticalSort(a,b)).forEach(function(key) {
			new_post_list[key] = post_list[key];
		});
	}

	return new_post_list;
}

function alphabeticalSort(a,b) {
	return a.localeCompare(b);
}

function reverseAlphabeticalSort(a,b) {
	return b.localeCompare(a);
}
