window.Tetris = window.Tetris  || {}; // equivalent to if(!window.Tetris) window.Tetris = {};
Tetris.Utils = {};

Tetris.Utils.cloneVector = function (v) {
  return {x: v.x, y: v.y, z: v.z};
};
Tetris.Utils.roundVector = function(v) {
  v.x = Math.round(v.x);
  v.y = Math.round(v.y);
  v.z = Math.round(v.z);
};

Tetris.Block = {};

Tetris.Block.shapes = [
  [
    {x: 0, y: 0, z: 0},
    {x: 1, y: 0, z: 0},
    {x: 1, y: 1, z: 0},
    {x: 1, y: 2, z: 0}
  ],
  [
    {x: 0, y: 0, z: 0},
    {x: 0, y: 1, z: 0},
    {x: 0, y: 2, z: 0}
  ],
  [
    {x: 0, y: 0, z: 0},
    {x: 0, y: 1, z: 0},
    {x: 1, y: 0, z: 0},
    {x: 1, y: 1, z: 0}
  ],
  [
    {x: 0, y: 0, z: 0},
    {x: 0, y: 1, z: 0},
    {x: 0, y: 2, z: 0},
    {x: 1, y: 1, z: 0}
  ],
  [
    {x: 0, y: 0, z: 0},
    {x: 0, y: 1, z: 0},
    {x: 1, y: 1, z: 0},
    {x: 1, y: 2, z: 0}
  ]
];

Tetris.Block.position = {};

Tetris.Block.generate = function() {
  var geometry, tmpGeometry;

  var type = 2;
//  var type = Math.floor(Math.random()*(Tetris.Block.shapes.length));
  this.blockType = type;

  Tetris.Block.shape = [];
  for(var i = 0; i < Tetris.Block.shapes[type].length; i++) {
    Tetris.Block.shape[i] = Tetris.Utils.cloneVector(Tetris.Block.shapes[type][i]);
  }
  // to be continued...
  geometry = new THREE.CubeGeometry(Tetris.blockSize, Tetris.blockSize, Tetris.blockSize);
  for(var i = 1 ; i < Tetris.Block.shape.length; i++) {
    tmpGeometry = new THREE.Mesh(new THREE.CubeGeometry(Tetris.blockSize, Tetris.blockSize, Tetris.blockSize));
    tmpGeometry.position.x = Tetris.blockSize * Tetris.Block.shape[i].x;
    tmpGeometry.position.y = Tetris.blockSize * Tetris.Block.shape[i].y;
    THREE.GeometryUtils.merge(geometry, tmpGeometry);
  }
  // to be continued...
  Tetris.Block.mesh = THREE.SceneUtils.createMultiMaterialObject(geometry, [
    new THREE.MeshBasicMaterial({color: 0x000000, shading: THREE.FlatShading, wireframe: true, transparent: true}),
    new THREE.MeshBasicMaterial({color: 0xff0000})
  ]);
  // to be continued...
  // initial position
  Tetris.Block.position = {x: Math.floor(Tetris.boundingBoxConfig.splitX/2)-1, y: Math.floor(Tetris.boundingBoxConfig.splitY/2)-1, z: 15};

  Tetris.Block.mesh.position.x = (Tetris.Block.position.x - Tetris.boundingBoxConfig.splitX/2)*Tetris.blockSize/2;
  Tetris.Block.mesh.position.y = (Tetris.Block.position.y - Tetris.boundingBoxConfig.splitY/2)*Tetris.blockSize/2;
  Tetris.Block.mesh.position.z = (Tetris.Block.position.z - Tetris.boundingBoxConfig.splitZ/2)*Tetris.blockSize + Tetris.blockSize/2;
  Tetris.Block.mesh.rotation = {x: 0, y: 0, z: 0};
  Tetris.Block.mesh.overdraw = true;

  if(Tetris.Board.testCollision(true) === Tetris.Board.COLLISION.GROUND) {
      Tetris.gameOver = true;
      Tetris.pointsDOM.innerHTML = "GAME OVER";
      Cufon.replace('#points');
  }

  Tetris.scene.add(Tetris.Block.mesh);
}; // end of Tetris.Block.generate()
Tetris.Block.rotate = function(x,y,z) {
  Tetris.Block.mesh.rotation.x += x * Math.PI / 180;
  Tetris.Block.mesh.rotation.y += y * Math.PI / 180;
  Tetris.Block.mesh.rotation.z += z * Math.PI / 180;

  // append to Tetris.Block.rotate()
  var rotationMatrix = new THREE.Matrix4();
  rotationMatrix.setRotationFromEuler(Tetris.Block.mesh.rotation);
  for (var i = 0; i < Tetris.Block.shape.length; i++) {
      Tetris.Block.shape[i] = rotationMatrix.multiplyVector3(
          Tetris.Utils.cloneVector(Tetris.Block.shapes[this.blockType][i])
      );
    Tetris.Utils.roundVector(Tetris.Block.shape[i]);
  }
// to be continued

  // append to Tetris.Block.rotate()
  if (Tetris.Board.testCollision(false) === Tetris.Board.COLLISION.WALL) {
      Tetris.Block.rotate(-x, -y, -z); // laziness FTW
  }
};
Tetris.Block.move = function(x,y,z) {
  Tetris.Block.mesh.position.x += x*Tetris.blockSize;
  Tetris.Block.position.x += x;

  Tetris.Block.mesh.position.y += y*Tetris.blockSize;
  Tetris.Block.position.y += y;

  Tetris.Block.mesh.position.z += z*Tetris.blockSize;
  Tetris.Block.position.z += z;
//  if(Tetris.Block.position.z == 0) Tetris.Block.hitBottom();

  var collision = Tetris.Board.testCollision((z != 0));
  if (collision === Tetris.Board.COLLISION.WALL) {
    Tetris.Block.move(-x, -y, 0); // laziness FTW
  }
  if (collision === Tetris.Board.COLLISION.GROUND) {
    Tetris.Block.hitBottom();
    Tetris.Board.checkCompleted();
  }
};
Tetris.Block.hitBottom = function() {
  Tetris.Block.petrify();
  Tetris.scene.__removeObject(Tetris.Block.mesh);
  Tetris.Block.generate();
};
Tetris.Block.petrify = function() {
  var shape = Tetris.Block.shape;
  for(var i = 0 ; i < shape.length; i++) {
    Tetris.addStaticBlock(Tetris.Block.position.x + shape[i].x, Tetris.Block.position.y + shape[i].y, Tetris.Block.position.z + shape[i].z);
    Tetris.Board.fields[Tetris.Block.position.x + shape[i].x][Tetris.Block.position.y + shape[i].y][Tetris.Block.position.z + shape[i].z] = Tetris.Board.FIELD.PETRIFIED;
  }
};

window.addEventListener('keydown', function (event) {
  var key = event.which ? event.which : event.keyCode;
  var cameraPositon = Tetris.Utils.cloneVector(Tetris.camera.position);

  switch(key) {
    case 38: // up (arrow)
        Tetris.Block.move(0, 1, 0);
      //Tetris.camera.position.z -= 10;
      break;
    case 40: // down (arrow)
      Tetris.Block.move(0, -1, 0);
     // Tetris.camera.position.z += 10;
      break;
    case 37: // left(arrow)
      Tetris.Block.move(-1, 0, 0);
      console.log(Tetris.Block.position.x);
      break;
    case 39: // right (arrow)
      Tetris.Block.move(1, 0, 0);
      console.log(Tetris.Block.position.x);
      break;
    case 32: // space
      Tetris.Block.move(0, 0, -1);
      break;

    case 87: // up (w)
      Tetris.Block.rotate(90, 0, 0);
      break;
    case 83: // down (s)
      Tetris.Block.rotate(-90, 0, 0);
      break;

    case 65: // left(a)
      Tetris.Block.rotate(0, 0, 90);
      break;
    case 68: // right (d)
      Tetris.Block.rotate(0, 0, -90);
      break;

    case 81: // (q)
      Tetris.Block.rotate(0, 90, 0);
      break;
    case 69: // (e)
      Tetris.Block.rotate(0, -90, 0);
      break;
  }
}, false);