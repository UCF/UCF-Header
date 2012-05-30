 //<[CDATA[
   var caslon = {
	   
	   //tells which flash file contains the desired font.
  src: '/flash/caslon.swf'
};

sIFR.activate(caslon);

sIFR.replace(caslon, {
  selector: '.sifrd',
  
  //below adjusts the "padding" between the top of the flash and the top of the text
  //offsetTop: '8px',
  
  //these allow fine tuning of the dimensions of the flash piece
  
  //tuneHeight: '3px',
  //tuneWidth: '1px',
  
  //allows the flash to be transparent
  wmode: 'transparent',
 // preventWrap: 'true',
forceClear: 'true',
repaintOnResize: 'true',

//below allows css to be passed into the siFR piece.
    css: [
      '.sIFR-root { background-color: #3366CC; }'
]
	
	});
