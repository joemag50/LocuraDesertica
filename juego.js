//JCGE 11-02-18
// Juego de 
//Variables

var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'gameDiv');

var fondo,                //Imagen del fondo
	player,               //Personaje
	dirKeys,              //Teclas para moverte
	flechas,              //Grupo de flechas
	tiempoFlecha = 0,     //Tiempo para lanzar la siguiente flecha
	deltaFlecha,   //la diferencia para lanzar la siguiente flecha
	flechaVel = 200,
	parado,agachado,      //Estados de los HITBOX
	flechasLanzadas = 0,  //Las flechas que ha lanzado
	globalGravity = 500,  //La gravedad
	playerJumped = false, //Ha saltado el personaje
	scoreText, score = 0,
	highscoreText;

//Este es nuestro objeto main
var Main =
{
	preload: function()
	{
		//Cargamos nuestros recursos del juego
		//Vamos a cargar el fondo
		game.load.image('flecha', 'img/flecha.png');
		//y el sprite del jugador
		game.load.spritesheet('player','img/aventurero.png', 80, 110);
	},

	create: function()
	{
		//Se va a ejecutar cuando inicie nuestro juego, Va mostrar todos nuestros objetos
		game.physics.startSystem(Phaser.Physics.ARCADE);

		fondo = game.add.tileSprite(0, 0, 800, 600, 'fondo');
		player = game.add.sprite(game.world.centerX, 500,'player');

		game.physics.arcade.enable(player);
		player.anchor.setTo(0.5, 0.5);
		player.animations.add('idle',[0], 8, true);
		player.animations.add('walk', [9,10], 8, true);
		player.animations.add('duck', [3], 10, true);
		player.body.collideWorldBounds = true;
		player.body.gravity.y = globalGravity;

		parado = {"w":65,"h":90,"x":10,"y":20};
		agacha = {"w":65,"h":70,"x":10,"y":30};

		player.body.setSize(parado.w,parado.h,parado.x,parado.y);

		//player.body.setSize(agacha.w,agacha.h,agacha.x,agacha.y);

		dirKeys = game.input.keyboard.createCursorKeys();

		flechas = game.add.physicsGroup();
		flechas.enableBody = true;
		flechas.physicsBodyType = Phaser.Physics.ARCADE;
		flechas.createMultiple(150, 'flecha');
		flechas.setAll('outOfBoundsKill', true);
		flechas.setAll('checkWorldBounds', true);

		if (localStorage.getItem('highscore') == null)
		{
			localStorage.setItem('highscore', score);
		}

		var style = { font: "50px", fill: "#452D00", align: "center" };
		scoreText = game.add.text(game.world.centerX, 100, "Puntaje: "+score, style);
		highscoreText = game.add.text(game.world.centerX, 50, "Mejor: "+localStorage.getItem('highscore'), style);
		scoreText.anchor.setTo(0.5,0.5);
		highscoreText.anchor.setTo(0.5,0.5);

		game.time.events.loop(Phaser.Timer.SECOND, this.score, this);

		deltaFlecha = 2000;
	},

	update: function()
	{
		//console.log(dirKeys);

		game.physics.arcade.collide(player, flechas, this.collisionHandler, null, this);


		var flecha, yRandom;

		if (game.time.now > tiempoFlecha)
		{
			flecha = flechas.getFirstExists(false);
		}

		if (flecha)
		{
			yRandom = Math.floor((Math.random() * 300) + 295);
			console.log(yRandom);
			var xRandom = Math.floor(Math.random()*2);
			console.log(xRandom);
			flecha.reset(800 * xRandom, yRandom);
			if (xRandom == 0)
			{
				flecha.body.velocity.x = flechaVel;
				flecha.scale.setTo(-1,1);
			}
			else
			{
				flecha.body.velocity.x = -flechaVel;
				flecha.scale.setTo(1,1);
			}
			tiempoFlecha = game.time.now + deltaFlecha;
			if (flechasLanzadas == 2)
			{
				deltaFlecha-=150;
				if (deltaFlecha < 700)
				{
					deltaFlecha = 700;
				}
				flechasLanzadas = 0;
				flechaVel+=50;
				if (flechaVel > 1000)
				{
					flechaVel = 1000;
				}
			}
			flechasLanzadas++;
		}
		
		if (dirKeys.down.isDown)
		{
			player.animations.play('duck');
			player.body.setSize(agacha.w,agacha.h,agacha.x,agacha.y);
			player.body.gravity.y = globalGravity + 1000;
			return;
		}
		else if (dirKeys.down.isUp)
		{
			player.body.gravity.y = globalGravity;
			player.body.setSize(parado.w,parado.h,parado.x,parado.y);
		}

		if (dirKeys.up.isDown && player.body.onFloor())
		{
			player.body.velocity.y = -200;
			playerJumped = true;
		}
		else if (dirKeys.up.isDown && playerJumped == true)
		{
			player.body.gravity.y = globalGravity - 400;
		}
		else if (dirKeys.up.isUp)
		{
			player.body.gravity.y = globalGravity;
			playerJumped = false;
		}

		//Revisamos colisiones, realizamos movimiento, y animaciones
		if (dirKeys.right.isDown)
		{
			player.animations.play('walk');
			player.scale.setTo(1,1);
			player.position.x += 3;
			fondo.tilePosition.x -= 0.5;
			return;
		}
		
		if (dirKeys.left.isDown)
		{
			player.animations.play('walk');
			player.scale.setTo(-1,1);
			player.position.x -= 3;
			fondo.tilePosition.x += 0.5;
			return;
		}

		player.animations.play('idle');
	}, 

	render : function ()
	{
		//game.debug.body(player);
		//game.debug.body(flechas);
	},

	collisionHandler : function (player, veg)
	{
		localStorage.setItem('highscore', score);
		//localStorage.getItem('highscore');
		this.murido();
	},

	score : function ()
	{
		score+=1;
		scoreText.text = 'Puntaje: ' + score;

	},

	murido : function ()
	{
		player.kill();
		score = 0;
		game.state.start('inicio');
	}
}

var enter;
var Inicio =
{
	preload: function ()
	{
		game.load.image('fondo', 'img/fondo.png');
	},

	create: function ()
	{
		game.add.tileSprite(0, 0, 800, 600, 'fondo');
		enter = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);

		var style = { font: "100px Adventure", fill: "#452D00", align: "center" };
		var titulo = game.add.text(game.world.centerX, 100, "Locura Desertica", style);
		style = { font: "30px Adventure", fill: "#452D00", align: "center" };
		var controles = game.add.text(game.world.centerX, 200, "Arrow Keys - Para moverte", style);
		var reglas = game.add.text(game.world.centerX, 250, "Esquiva las flechas", style);
		var inicio = game.add.text(game.world.centerX, 300, "Enter para iniciar", style);
		titulo.anchor.set(0.5);
		controles.anchor.set(0.5);
		reglas.anchor.set(0.5);
		inicio.anchor.set(0.5);
	},

	update: function ()
	{
		if (enter.isDown)
		{
			game.state.start('main');
		}
	}
}


game.state.add('main', Main);
game.state.add('inicio', Inicio);

game.state.start('inicio');