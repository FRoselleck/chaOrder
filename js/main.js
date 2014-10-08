var gameWidth=640;
var gameHeight=1136;
var game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, '', { preload: preload, create: create , update: update,render: render});

function preload() {
    game.stage.backgroundColor=0xFFFFFF;
	game.load.image('board', 'imgs/board.png');
	game.load.image('ZL', 'imgs/ZL.png');
	game.load.image('AL', 'imgs/AL.png');
	game.load.image('ZS', 'imgs/ZS.png');
	game.load.image('AS', 'imgs/AS.png');
	game.load.image('balance', 'imgs/balance.png');
	game.load.image('order', 'imgs/order.png');
	game.load.image('chaos', 'imgs/chaos.png');
	game.load.image('s0', 'imgs/0.png');
	game.load.image('s1', 'imgs/1.png');
	game.load.image('s2', 'imgs/2.png');
	game.load.image('s3', 'imgs/3.png');
	game.load.image('s4', 'imgs/4.png');
	game.load.image('s5', 'imgs/5.png');
	game.load.image('s6', 'imgs/6.png');
	game.load.spritesheet('winInfo', 'imgs/winInfo.png', 450, 170);
	// game.load.spritesheet('fire', 'imgs/fire.png', 82, 83);
	// game.load.spritesheet('freeze', 'imgs/freeze.png', 82, 83);

}
/*
Object.prototype.Clone = function()
 {
    var objClone;
    if ( this.constructor == Object ) objClone = new this.constructor(); 
    else objClone = new this.constructor(this.valueOf()); 
    for ( var key in this )
    {
        if ( objClone[key] != this[key] )
        { 
            if ( typeof(this[key]) == 'object' )
            { 
                objClone[key] = this[key].Clone();
            }
            else
            {
                objClone[key] = this[key];
            }
        }
    }
    objClone.toString = this.toString;
    objClone.valueOf = this.valueOf;
    return objClone; 
 }    

 */


// function fire()
// {
// 	var fire = game.add.sprite(200, 200, 'fire');
// 	fire.animations.add("run",[0,1,2,3,4,5],15,true);
// 	fire.animations.play("run");
// }
// function freeze()
// {
// 	var fire = game.add.sprite(200, 400, 'freeze');
// 	fire.animations.add("run",[0,1,2,3,4,5],15,true);
// 	fire.animations.play("run");
// }
var testinfo='start';
var test=new Object();
	test.a=0;
	test.b=0;
	test.c=0;





var accessArray = new Array();
{
	for(var i=0;i<20;i++)
	{
		accessArray[i]=new Array();
		for(var ii=i;ii<20;ii++)
		{
			// accessArray[i][ii]=new Object();
			// accessArray[i][ii].typ=0;// typ 0 cannot access, 1 can access directly, 2 access through big area;
			// accessArray[i][ii].mid=-1;// mid area for access through
			accessArray[i][ii]=-2;//-2 cannot access. -1 access directly. else is the area# access through.
		}
	}
	// same board access
	for(var i=0;i<20;i+=10)
	{
		accessArray[0+i][6+i]=-1;
		accessArray[1+i][7+i]=-1;
		accessArray[2+i][8+i]=-1;
		accessArray[3+i][7+i]=-1;
		accessArray[3+i][8+i]=-1;
		accessArray[4+i][6+i]=-1;
		accessArray[4+i][7+i]=-1;
		accessArray[5+i][6+i]=-1;
		accessArray[5+i][8+i]=-1;
		accessArray[6+i][9+i]=-1;// center tomb move to tail area
		accessArray[6+i][7+i]=4+i;
		accessArray[6+i][8+i]=5+i;
		accessArray[7+i][8+i]=3+i;
	}
	//access between boards
	accessArray[3][13]=-1;
	accessArray[7][18]=-1;
	accessArray[8][17]=-1;
}
function access(x,y)
{
	if(x>y)
	{
		var z=y;
		y=x;
		x=z;
	}
	return accessArray[x][y];
}


var initFinished =false;
var clickStat =0;
var score=new Array();
	score[0]=0;
	score[1]=0;
var winInfo;
var gameNotOver=true;
var tween;
var scoreA;
var scoreAb;
var scoreZ;
var scoreZb;
function scoreCheck()
{
	score[0]=0;
	score[1]=0;
	for(var i=0;i<6;i++)
	{
		if(MP[i].cont[1].chessid!=-1 && MP[i].own!=chess[MP[i].cont[1].chessid].own)
			score[chess[MP[i].cont[1].chessid].own]++;
		if(MP[i+10].cont[1].chessid!=-1 && MP[i+10].own!=chess[MP[i+10].cont[1].chessid].own)
			score[chess[MP[i+10].cont[1].chessid].own]++;
	}
	if(score[0]>=3 || score[1]>=3)
	{
		if(score[0]==score[1])
			return player.o();
		else if(score[0]>score[1])
			return 0;
		else if(score[0]<score[1])
			return 1;
	}
	return -1;
}
var player = new Object();
	player.p=0;// playing
	player.r=0;// played rounds
	player.o =function()// opposite
	{
		return player.p===0? 1:0;
	}
	player.change =function()
	{
		player.r++;
		player.p=player.o();
		for(var i=0;i<12;i++)
			if(chess[i].own===player.p)
				chess[i].health++;
			//revive chess in tomb after 1 round;
		var winplayer=scoreCheck();
		// someone win
		if(winplayer>-1)
		{
			gameNotOver=false;
			for(var i=0;i<12;i++)
				chess[i].inputEnabled=false;
			if(winplayer===0)
				winInfo.animations.play("order");
			else
				winInfo.animations.play("chaos");
			tween = game.add.tween(winInfo.scale).to( { x: 1, y: 1 }, 1000, Phaser.Easing.Elastic.Out, true);
		}

	}
var selectedChess=-1;
var selectedArea=-1;

var chess = new Array();

var CP = new Object();//center postion caculated from

	CP.x = gameWidth/2;
	CP.y = gameHeight/2;

var DiBoard = 263;//diameter of  board
var DiBattle =90;//diameter of battle area
var DiTomb =60;
var AR =
{
	createNew: function(type,own,x,y,agl)
	{
		var area = new Object();
		area.typ=type;//0 battle, 1 big, 2 small, 3 core, 4  -1 null 
		area.own=own;//0 ordre, 1 chaos , also use by domained by for battle area. -1 unused;
		area.cap= (type===0||type===4)? 4:1 ; //capbility
		area.hold=0;// hold #
		area.x=CP.x+x;// delta x
		area.y=CP.y+y;// delta y
		area.agl=agl;// content angle
		area.cont= new Array();//content
		for (var i = 1; i <=4; i++) // cannot use index 0
		{
			area.cont[i]= new Object();
			area.cont[i].chessid = -1;//-1 no chess on ; the chessID 
			area.cont[i].x=area.x;
			area.cont[i].y=area.y;
		}
		// area.cont[5]= game.add.sprite(area.x,area.y,'AL');
		return area;
	}
};
var MP = new Array();//Map Point Position
{

	MP[0] = new AR.createNew(2,		0,	0,		295, 	180);
	MP[1] = new AR.createNew(2,		0,	-103,	117,	180);
	MP[2] = new AR.createNew(2,		0,	103,	117,	180);
	MP[3] = new AR.createNew(3,		0,	0,		57,		0);
	MP[4] = new AR.createNew(1,		0,	-103,	236,	0);
	MP[5] = new AR.createNew(1,		0,	103,	236,	0);
	MP[6] = new AR.createNew(0,		0,	0,		355,	180);
	MP[7] = new AR.createNew(0,		0,	-155,	87,		180);
	MP[8] = new AR.createNew(0,		0,	155,	87,		180);
	MP[9] = new AR.createNew(-1,	0,	0,		176,	0);
	for(var i=10;i<20;i++)
		MP[i]= new AR.createNew(MP[i-10].typ,1,(MP[i-10].x-CP.x)*-1,(MP[i-10].y-CP.y)*-1,(MP[i-10].agl===0? 180:0));
	for(var i=6;i<9;i++)
	{	
		MP[i].cont[2].y+=DiBattle;
		MP[i].cont[3].x-=DiBattle*0.866;
		MP[i].cont[3].y-=DiBattle*0.5;
		MP[i].cont[4].x+=DiBattle*0.866;
		MP[i].cont[4].y-=DiBattle*0.5;
	}
	for(var i=16;i<19;i++)
	{	
		MP[i].cont[2].y-=DiBattle;
		MP[i].cont[3].x-=DiBattle*0.866;
		MP[i].cont[3].y+=DiBattle*0.5;
		MP[i].cont[4].x+=DiBattle*0.866;
		MP[i].cont[4].y+=DiBattle*0.5;
	}
		MP[9].cont[2].y+=DiTomb;
		MP[9].cont[3].x-=DiTomb*0.866;
		MP[9].cont[3].y-=DiTomb*0.5;
		MP[9].cont[4].x+=DiTomb*0.866;
		MP[9].cont[4].y-=DiTomb*0.5;
		MP[19].cont[2].y-=DiTomb;
		MP[19].cont[3].x-=DiTomb*0.866;
		MP[19].cont[3].y+=DiTomb*0.5;
		MP[19].cont[4].x+=DiTomb*0.866;
		MP[19].cont[4].y+=DiTomb*0.5;
}

var Chess =
{
	createNew: function(i)
	{
		var texture;
		var type =Math.floor(i/3);
		switch (type)
		{
			case 0:
				texture='AS';
				break;
			case 1:
				texture='AL';
				break;
			case 2:
				texture='ZS';
				break;
			case 3:
				texture='ZL';
				break;
		}
		// var tempChess= game.add.sprite(CP.x+MP[ii][i%6].x,CP.y+MP[ii][i%6].y,texture);
		var tempChess= game.add.sprite(CP.x,CP.y,	texture);

		tempChess.anchor.setTo(0.5, 2/3);

		//  And enable the Sprite to have a physics body:
    	game.physics.arcade.enable(tempChess);
    	tempChess.body.allowRotation=true;
    	tempChess.inputEnabled = true;
    	tempChess.input.consumePointerEvent=true;
    	tempChess.input.pixelPerfectAlpha=10;
    	tempChess.input.pixelPerfectClick=true;
    	tempChess.input.bringToTop=true;


    	tempChess.health=1;
		tempChess.own = type<2 ? 0:1;// 0 order, 1 chaos
    	// tempChess.z=2*i + tempChess.own;// set smaller in the front
		tempChess.typ = type%2===0 ? 0:1;// 0 small , 1 big
		tempChess.belong = 0;// which area.
		tempChess.belong2= 0;// the content position of area
		return tempChess;
	}
};

function areaLevel(areaid)// the # of the domain chesses; 
{ 
	var N0=0,N1=0;//Np # chess of 0 or 1
	for(var ii=1;ii<=4;ii++)
	{
		if(MP[areaid].cont[ii].chessid===-1)
			continue;
		else if(MP[areaid].cont[ii].chessid<6)
			N0++;
		else if(MP[areaid].cont[ii].chessid>=6)
			N1++;
	}
	return N1>N0? N1: N0;
}
function battleChange()
{	// battle own;
	for(var i=0; i<20;i++)
	{
		if(MP[i].typ===0)
		{
			if(MP[i].hold===0)
				MP[i].own=-1;
			else
			{
				var N0=0,N1=0;//Np # chess of 0 or 1
				for(var ii=1;ii<=4;ii++)
				{
					if(MP[i].cont[ii].chessid===-1)
						continue;
					else if(MP[i].cont[ii].chessid<6)
						N0++;
					else if(MP[i].cont[ii].chessid>=6)
						N1++;
				}

        		// game.debug.text(N0, 40, 80,0xFFFFFF);
        		// game.debug.text(N1, 40, 120,0xFFFFFF);
				// no condition they are equal.
				if(N0>N1)
					MP[i].own=0;
				if(N0<N1)
					MP[i].own=1;

			}
			switch(MP[i].own)
			{
				case 0:
					MP[i].cont[5].loadTexture('order');
					MP[i].cont[5].body.angularVelocity=10;
					MP[i].cont[5].scale.set(0.8);
					break;
				case 1:
					MP[i].cont[5].loadTexture('chaos');
					MP[i].cont[5].body.angularVelocity=-10;
					MP[i].cont[5].scale.set(0.8);
					break;
				case -1:		
					MP[i].cont[5].loadTexture('balance');
					MP[i].cont[5].body.angularVelocity=0;
					MP[i].cont[5].angle=MP[i].agl;
					MP[i].cont[5].scale.set(1.5);
					break; 
			}
		}
	}
}
function boardChange(chessid,coreid)
{
	var chessown= chess[chessid].own;
	var chessownoppo = chessown===0? 1:0;
	switch(coreid)
	{
		case 3:
			for(var i=0;i<20;i++)
			{
				if(i===6)
					i=9;
				if(i===16)
					i=19;
				MP[i].own= i<10 ? chessown:chessownoppo;
			}
			break;
		case 13:
			for(var i=0;i<20;i++)
			{
				if(i===6)
					i=9;
				if(i===16)
					i=19;
				MP[i].own= i<10 ? chessownoppo:chessown;
			}
			break;
		default:
		return false;
	}
	for(var i=9;i<20;i+=10)
	{
		//tomb sign
		if(MP[i].typ===-1)
		{
			switch(MP[i].own)
			{
				case 0:
					MP[i].cont[5].loadTexture('order');
					MP[i].cont[5].body.angularVelocity=10;
					MP[i].cont[5].scale.set(0.8);
					break;
				case 1:
					MP[i].cont[5].loadTexture('chaos');
					MP[i].cont[5].body.angularVelocity=-10;
					MP[i].cont[5].scale.set(0.8);
					break;
				case -1:		
					MP[i].cont[5].loadTexture('balance');
					MP[i].cont[5].body.angularVelocity=0;
					MP[i].cont[5].angle=MP[i].agl;
					break; 
			}
		}
	}
	return true;
}
function moveIn(chessid,areaid,contid)
{

	chess[chessid].belong = areaid;
	chess[chessid].belong2= contid;
	MP[areaid].hold++;
	MP[areaid].cont[contid].chessid=chessid;
	// step in a foe core?
	if(chess[chessid].own!=MP[areaid].own && (areaid===3 || areaid===13))
		boardChange(chessid,areaid);
}
function moveOut (chessid)
{
	MP[chess[chessid].belong].hold--;
	MP[chess[chessid].belong].cont[chess[chessid].belong2].chessid=-1;
	//when a chess leave a core, if the oppo core is also a own chess, and oppo core is foe
	switch(chess[chessid].belong)
	{
		case 3:
			if(MP[13].cont[1].chessid!=-1 && chess[MP[13].cont[1].chessid].own===chess[chessid].own &&MP[13].own!=chess[chessid].own)
				boardChange(MP[13].cont[1].chessid,13);
			return true;
		case 13:
			if(MP[3].cont[1].chessid!=-1 && chess[MP[3].cont[1].chessid].own===chess[chessid].own &&MP[3].own!=chess[chessid].own)
				boardChange(MP[3].cont[1].chessid,3);
			return true;
		default:
			return false;
	}
}
function goTomb(chessid)
{
	testinfo='die';
	tombid= chess[chessid].own===MP[9].own? 9:19;
	if(MP[tombid].hold<4)
	{
		var contid=1;
		for(var i=1;i<=4;i++)
			if(MP[tombid].cont[i].chessid===-1)
			{
				contid=i;	
				break;
			}
		moveOut(chessid);
		moveIn(chessid,tombid,contid);
		chess[chessid].health=0;
		// chess[chessid].inputEnabled=false;
		return true;
	}
	else
		return false;
}
function revive()
{
		//chess revive;
	for(var i=0;i<12;i++)
	{
		if(chess[i].health>0)
		{
			switch(chess[i].belong)
			{
				case 9:
					move(i,6);
					break;
				case 19:
					move(i,16);
					break;

			}
		}
	}
}
function contSort(areaid)
{
	// for(var i=1;i<=MP[areaid].hold;i++)
	// {
	// 	if(MP[areaid].cont[i].chessid===-1)
	// 	{
	// 		for(var ii=i+1;ii<=4;i++)
	// 			if(MP[areaid].cont[ii].chessid!=-1)
	// 			{
	// 				MP[areaid].cont[i].chessid=MP[areaid].cont[ii].chessid;
	// 				MP[areaid].cont[ii].chessid;
	// 				break;
	// 			}
	// 	}
	// }
	var tempchessid=-2;
	for(var i=3;i>1;i--)
		for(var ii=1;ii<=i;ii++)
		{
			if(MP[areaid].cont[ii].chessid===-1 && MP[areaid].cont[ii+1].chessid!=-1)
			{
				// tempchessid=MP[areaid].cont[ii].chessid;
				// MP[areaid].cont[ii].chessid=MP[areaid].cont[ii+1].chessid;
				// MP[areaid].cont[ii+1].chessid=tempchessid;
				tempchessid=MP[areaid].cont[ii+1].chessid;
				moveOut(tempchessid);
				moveIn(tempchessid,areaid,ii);
			}
		}
}
function areaSort()
{
	for(var i=0;i<20;i++)
		if(MP[i].typ===0 || MP[i].typ===-1)
			contSort(i);
}
function move(chessid,areaid)
{
	// make decision
	// if(typeof die ==='undefined')
	// 	die=0;
	//if die is true 
	// else if(die===1)
	// 	{
			// if(MP[areaid].hold<4)
			// {
			// 	for(var i=1;i<=4;i++)
			// 		if(MP[areaid].cont[i].chessid===-1)
			// 		{
			// 			contid=i;
			// 			break;
			// 		}
			// }
		// 	break;
		// }
	var contid=1;
	// cannot move into the current areaid
	if(chess[chessid].belong===areaid)
		return false;

	//can it move into the target? check access array
	var mid= access(chess[chessid].belong,areaid);
	// test.a=mid;
	// test.b=chess[chessid].belong;
	// test.c=areaid;
	switch(mid)
	{
		case -2:
			return false;
		case -1:
			break;
		default:
			if(MP[mid].hold>0 && chess[MP[mid].cont[1].chessid].own===chess[chessid].own && chess[MP[mid].cont[1].chessid].typ===1 && chess[chessid].typ===0)
				break;
			else
				return false;
	}


	//caculate the areaid domain level
	// dLevel=areaLevel(areaid)


	// two condition cannot move caused by oppo domain level
	// in a battle area, level >=2 and it's not the same own, then cannot move out
	if(MP[chess[chessid].belong].typ===0 && MP[chess[chessid].belong].own!=chess[chessid].own && areaLevel(chess[chessid].belong)>=2)		 
			return false;
	// to a battle area, level >=3 and it's not the same own, then cannot move in
	if(MP[areaid].typ===0 && MP[areaid].own!=chess[chessid].own && areaLevel(areaid)>=3)		 
			return false;	



				        // game.debug.text(MP[areaid].hold, 40, 80,0xFFFFFF);
	//decide area type
	switch(MP[areaid].typ)
	{
		case 0://battle
			//find a empty cont position for the moving chess
			if(MP[areaid].hold<4)
			{
				for(var i=1;i<=4;i++)
					if(MP[areaid].cont[i].chessid===-1)
					{
						contid=i;
						break;
					}
			}
			else 
			{	
				// this is our full area, cannot step in more chess.
				if(MP[areaid].own===chess[chessid].own && areaLevel(areaid)===4)
					return false;
				else
				{
					// find a first foe chess first.
					for(var i=1;i<=4;i++)
						if(chess[MP[areaid].cont[i].chessid].own!=chess[chessid].own)
						{
							contid=i;
							break;
						}
					// find a first same type foe chess first.
					for(var i=1;i<=4;i++)
						if(chess[MP[areaid].cont[i].chessid].own!=chess[chessid].own && chess[MP[areaid].cont[i].chessid].typ ==chess[chessid].typ )
						{
							contid=i;
							break;
						}
					goTomb(MP[areaid].cont[contid].chessid);
				}


			}
			break;
		case 1:// big
		case 3://core
			// if this place already has chess
			if(MP[areaid].hold>0)
			{	
				// if it's a foe small chess and you are using a big chess, kill it!!
				if(chess[MP[areaid].cont[1].chessid].own!= chess[chessid].own && chess[MP[areaid].cont[1].chessid].typ===0 && chess[chessid].typ===1)
					goTomb(MP[areaid].cont[1].chessid);
				else // else condition cannot move in and replace.
					return false;

			}
			break;
		case 2:// small
			if(MP[areaid].hold>0 || chess[chessid].typ===1)// big chess cannot move in small area
				return false;
			break;
		case -1:// center tomb
			//tomb cannot be stepped in by player's hand.
		default:
			return false;

	}




	
	moveOut(chessid);
	moveIn(chessid,areaid,contid);
	battleChange();// not include change tomb sigh, tomb sigh is included in boardChange();
	areaSort();

	return true;
}



function moveAnimation()
{
	// game.physics.arcade.accelerateToXY(chess[chessid], MP[areaid].cont[contid].x, MP[areaid].cont[contid].y, 30, 100, 100);
	// game.physics.arcade.moveToXY(chess[chessid], MP[areaid].cont[contid].x, MP[areaid].cont[contid].y, 30);
	// if(initFinished)
	// {
		for (var i = 0; i <12; i++)
		{
			if(i===selectedChess)
				continue;
			game.physics.arcade.moveToXY(chess[i], MP[chess[i].belong].cont[chess[i].belong2].x,MP[chess[i].belong].cont[chess[i].belong2].y,0,200);
			if (game.physics.arcade.distanceBetween(chess[i],MP[chess[i].belong].cont[chess[i].belong2])>40)
				chess[i].body.angularVelocity	= 10* game.physics.arcade.distanceBetween(chess[i],MP[chess[i].belong].cont[chess[i].belong2]);
			else
			{
				if (chess[i].body.angularVelocity<10)
				{
					chess[i].body.angularVelocity=0;
					chess[i].angle=MP[chess[i].belong].agl;
				}
				else
				{
					if(MP[chess[i].belong].agl===0)
						chess[i].body.angularVelocity = (Math.abs(360-(chess[i].angle+360)%360))*10;
					if(MP[chess[i].belong].agl===180)
						chess[i].body.angularVelocity = (Math.abs(180-(chess[i].angle+360)%360))*10;
				}
			}

		}
	// which player is playing?

		MP[player.p*10+9].cont[5].body.angularVelocity=50+0.5*game.physics.arcade.distanceToPointer(MP[player.p+9]);
		MP[player.o()*10+9].cont[5].body.angularVelocity=10;
	// }
}
function clickEvent()
{
	testinfo='clicked';
	switch(clickStat)
	{
	case 0:
		testinfo+=' clickStat=0;';
		//why it cannot work!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		// for(var i=0;i<12;i++)
		// 	chess[i].input.pixelPerfectClick=true;
		for (var i = 0; i<12; i++)
		{
			//pixelPerfectClick cost too much? then open it when it neccessary
			// chess[i].input.pixelPerfectClick=true;
			if(chess[i].own===player.p && (chess[i].input.pointerDown(0) ||chess[i].input.pointerDown(1) ))
			{
				selectedChess=i;
				clickStat=1;
				chess[i].body.angularVelocity=500;
				testinfo+=selectedChess;
				testinfo+='.own='+chess[selectedChess].own;
			}
			// chess[i].input.pixelPerfectClick=false;
		}
		// for(var i=0;i<12;i++)
		// 	chess[i].input.pixelPerfectClick=false;
		break;
	case 1:
		testinfo+=' clickStat=1;';
		var selectedDistance=3000;
		// for(var i=0;i<12;i++)
		// 	chess[i].input.pixelPerfectClick=false;
		for(var i=0;i<20;i++)
		{
			if(selectedDistance>game.physics.arcade.distanceToPointer(MP[i]))
			{
				selectedDistance=game.physics.arcade.distanceToPointer(MP[i])
				selectedArea=i;
				// testinfo+=game.physics.arcade.distanceToPointer(MP[i].cont[1])+'\n';
			}

		}
		if (selectedDistance<50)// in the board.
			if(move(selectedChess,selectedArea))
			{				
				revive();
				player.change();  // switch players
			}
			// testinfo+=selectedArea;

		selectedChess=-1;
		selectedArea=-1;
		clickStat=0;
		break;

	}
}



function create() 
{
	//  To make the sprite move we need to enable Arcade Physics
    game.physics.startSystem(Phaser.Physics.ARCADE);
	
	var board_up = game.add.sprite(CP.x,CP.y-DiBoard, 'board');
	board_up.anchor.setTo(0.5, 0.5);
	var board_down = game.add.sprite(CP.x,CP.y+DiBoard, 'board');
	board_down.anchor.setTo(0.5, 0.5);
	board_down.angle=180;
	winInfo=game.add.sprite(CP.x,CP.y,'winInfo');
	winInfo.animations.add("null",[0],1,false);
	winInfo.animations.add("order",[3,4,5,4,3],2,true);
	winInfo.animations.add("chaos",[6,7,8,7,6],2,true);
	winInfo.animations.play("null");
	winInfo.anchor.set(0.5);
	winInfo.scale.set(0);
	scoreA = game.add.sprite(CP.x+200,CP.y+400, 's0');
	scoreA.anchor.set(0.5);
	scoreAb= game.add.sprite(CP.x+200,CP.y+400, 'order');
	scoreAb.anchor.set(0.5,2/3);
	scoreAb.scale.set(0.6);
	game.physics.arcade.enable(scoreAb);
    scoreAb.body.allowRotation=true;
	scoreAb.body.angularVelocity=10;
	scoreZ = game.add.sprite(CP.x-200,CP.y-400, 's0');
	scoreZ.anchor.set(0.5);
	scoreZb= game.add.sprite(CP.x-200,CP.y-400, 'chaos');
	scoreZb.anchor.set(0.5,2/3);
	scoreZb.scale.set(0.6);
	game.physics.arcade.enable(scoreZb);
    scoreZb.body.allowRotation=true;
	scoreZb.body.angularVelocity=-10;
	for (var i = 0; i <12; i++) 
	{
		chess[i] = new Chess.createNew(i);
		var mi=i;//map area id
		if (i>=6)// chaos chessid
			mi=i+4;//chaos area begin from 10;
		moveIn(i,mi,1);
	}
	//battle area sign.
	for(var i=0; i<20;i++)
	{

		if(MP[i].typ===0||MP[i].typ===-1)
		{
			MP[i].cont[5]=game.add.sprite(MP[i].x,MP[i].y,'balance');
			MP[i].cont[5].anchor.set(0.5,2/3);
			MP[i].cont[5].angle=MP[i].agl;
    		game.physics.arcade.enable(MP[i].cont[5]);
    		MP[i].cont[5].body.allowRotation=true;
			// MP[i].cont[5].body.angularVelocity = MP[i].own===0? 10:10;// rotation clockwise
		}
	}
	battleChange();
	boardChange(3,3);
	scoreCheck();

	initFinished=true;
	game.input.onTap.add(clickEvent);



	// move(0,19,3);
	// move(1,19,2);
	// move(2,19,4);
	// move(6,19,1);




}


function update() 
{
	if(initFinished)
	{	// score check;
		// scoreCheck();

		//control control
		// I don't know why if i put this in the player.change or similar function it will make the input confuse.
		for(var i=0;gameNotOver&&i<12;i++)
		{
			if((chess[i].belong===9)||(chess[i].belong===19))
				chess[i].inputEnabled=false;
			else
				chess[i].inputEnabled=true;
		}
		moveAnimation();
	}
	//game over and bring the wininfo to the front
	if(!gameNotOver)
	{
		winInfo.bringToTop();
		MP[9].cont[5].body.angularVelocity=0;
		MP[19].cont[5].body.angularVelocity=0;
	}

}
function render()
{
	// game.debug.inputInfo(32, 32);
        // game.debug.text(MP[chess[i].belong].cont[chess[i].belong2].x+'    '+MP[chess[i].belong].cont[chess[i].belong2].y, 40, 40)
        // game.debug.text('|'+scoreA.frameName+'|', 40, 40,0xFFFFFF);
        // game.debug.text('|'+'imgs/'+score[0]+'.png'+'|', 40, 80,0xFFFFFF);
        // game.debug.text(player.r, 40, 80,0xFFFFFF);
        // game.debug.text(chess[0].health+'  '+chess[1].health+'  '+chess[2].health+'  '+chess[3].health+'  '+chess[4].health+'  '+chess[5].health, 40, 100,0xFFFFFF);
        // game.debug.text(chess[6].health+'  '+chess[7].health+'  '+chess[8].health+'  '+chess[9].health+'  '+chess[10].health+'  '+chess[11].health, 40, 120,0xFFFFFF);
        // game.debug.text(MP[9].cont[1].chessid+'  '+MP[9].cont[2].chessid+'  '+MP[9].cont[3].chessid+'  '+MP[9].cont[4].chessid, 40, 140,0xFFFFFF);
        // game.debug.text(MP[19].cont[1].chessid+'  '+MP[19].cont[2].chessid+'  '+MP[19].cont[3].chessid+'  '+MP[19].cont[4].chessid, 40, 160,0xFFFFFF);
    // game.debug.text(' '+test.a+' '+test.b+' '+test.c, 30, 40,0xFFFFFF);
    // game.debug.text('Chaos.score:'+score[1], 30, 100,0xFFFFFF);
    // game.debug.text('Order.score:'+score[0], gameWidth-150, gameHeight-100,0xFFFFFF);

    // game.debug.text(game.input.mousePointer.id, 30, 100,0xFFFFFF);

    if(scoreA.frameName!=('imgs/'+score[0]+'.png'))
    {
    	scoreA.loadTexture('s'+score[0]);
    	scoreA.scale.set(0);
		tween = game.add.tween(scoreA.scale).to( { x: 1, y: 1 }, 1000, Phaser.Easing.Elastic.Out, true);
    	scoreAb.body.angularVelocity=score[0]*100+5;
		scoreAb.scale.set(score[0]/8+0.6);
	}
	if(scoreZ.frameName!=('imgs/'+score[1]+'.png'))
    {
    	scoreZ.loadTexture('s'+score[1]);
    	scoreZ.scale.set(0);
		tween = game.add.tween(scoreZ.scale).to( { x: 1, y: 1 }, 1000, Phaser.Easing.Elastic.Out, true);
    	scoreZb.body.angularVelocity=score[1]*-100-5;
		scoreZb.scale.set(score[1]/8+0.6);
	}
	// game.world.angle=90;
	// scoreA.loadTexture('s'+score[0]);
	// scoreAb.body.angularVelocity=score[0]*100+5;
    // scoreZ.loadTexture('s'+score[1]);
    // scoreZb.body.angularVelocity=score[1]*-100-5;
    // game.debug.text(winInfo, gameWidth/2-78, gameHeight/2+3,0xFFFFFF);
    // winText = new Text(game, gameWidth/2-78, gameHeight/2+3, winInfo, style);
}


