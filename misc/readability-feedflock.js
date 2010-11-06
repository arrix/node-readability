(function() {
  //require.paths.unshift('./vendor');
  var sys = require('sys');
  var jsdom = require('jsdom');
  //var htmlparser = require('./htmlparser');
  //var level = jsdom.defaultLevel;
  // var doc = new (level.Document)();
  // doc.createWindow = function() {
  //   window = jsdom.windowAugmentation(level, { document: doc, parser: htmlparser })
  //   delete window.document.createWindow
  //   return window
  // };
  // var document = doc.createWindow().document;

  var document;
  var Client = {
    parse: function(content, callback) {
      document = jsdom.jsdom(content).createWindow().document;
      //document.innerHTML = content;
      //console.log(document.body);
      if (!document.body) {
        callback({content:'',title:''});
        return;
      }
      
    	// Replace all doubled-up <BR> tags with <P> tags, and remove fonts.
    	var pattern =  new RegExp ("<br/?>[ \r\n\s]*<br/?>", "g");
    	document.body.innerHTML = document.body.innerHTML.replace(pattern, "</p><p>").replace(/<\/?font[^>]*>/g, '');

    	var allParagraphs = document.getElementsByTagName("p");
    	var contentDiv = null;
    	var topDivParas =[];

    	var articleContent = document.createElement("DIV");
    	var articleTitle = document.title

    	if (articleTitle)
    	  articleTitle = articleTitle.replace(/^\s+|\s+$/g, '');

    	// Study all the paragraphs and find the chunk that has the best score.
    	// A score is determined by things like: Number of <p>'s, commas, special classes, etc.
    	for (var j=0; j	< allParagraphs.length; j++) {
    		var parentNode = allParagraphs[j].parentNode;

        if(typeof(parentNode) != 'undefined') {
      		// Initialize readability data
      		if(typeof parentNode.readability == 'undefined')
      		{
      			parentNode.readability = {"contentScore": 0};

      			// Look for a special classname
      			if(parentNode.className.match(/(comment|meta|footer|footnote)/))
      				parentNode.readability.contentScore -= 50;
      			else if(parentNode.className.match(/((^|\\s)(post|hentry|entry[-]?(content|text|body)?|article[-]?(content|text|body)?)(\\s|$))/))
      				parentNode.readability.contentScore += 25;

      			// Look for a special ID
      			if(parentNode.id.match(/(comment|meta|footer|footnote)/))
      				parentNode.readability.contentScore -= 50;
      			else if(parentNode.id.match(/^(post|hentry|entry[-]?(content|text|body)?|article[-]?(content|text|body)?)$/))
      				parentNode.readability.contentScore += 25;
      		}

      		// Add a point for the paragraph found
      		if(this.getInnerText(allParagraphs[j]).length > 10)
      			parentNode.readability.contentScore++;

      		// Add points for any commas within this paragraph
      		parentNode.readability.contentScore += this.getCharCount(allParagraphs[j]);

      		topDivParas.push({ 'node': parentNode, 'score': parentNode.readability.contentScore });
      	}
    	}

    	for (var i=0; i	< topDivParas.length; i++) {
    	  var score = topDivParas[i].score;
        if (contentDiv == null || score > contentDiv.score) {
          contentDiv = { 'node': topDivParas[i].node, 'score': score }
        }
      }

      if (contentDiv == null)
        return callback({ content: '', title: '' });

      var topDiv = contentDiv.node

    	this.cleanStyles(topDiv);					// Removes all style attributes
    	topDiv = this.killDivs(topDiv);		// Goes in and removes DIV's that have more non <p> stuff than <p> stuff
    	topDiv = this.killBreaks(topDiv);  // Removes any consecutive <br />'s into just one <br />

    	// Cleans out junk from the topDiv just in case:
    	topDiv = this.clean(topDiv, "form");
    	topDiv = this.clean(topDiv, "object");
    	topDiv = this.clean(topDiv, "table", 250);
    	topDiv = this.clean(topDiv, "h1");
    	topDiv = this.clean(topDiv, "h2");
    	topDiv = this.clean(topDiv, "iframe");

    	articleContent.appendChild(topDiv);

    	return callback({ content: articleContent.innerHTML, title: articleTitle });
    },
    getInnerText: function(e) {
    	return e.textContent;
    },
    getCharCount: function( e,s ) {
      s = s || ",";
      return this.getInnerText(e).split(s).length;
    },
    cleanStyles: function( e ) {
      e = e || document;
      var cur = e.firstChild;

    	// If we had a bad node, there's not much we can do.
    	if(!e)
    		return;

    	// Remove any root styles, if we're able.
    	if(typeof e.removeAttribute == 'function')
    		e.removeAttribute('style');

        // Go until there are no more child nodes
        while ( cur != null ) {
    		if ( cur.nodeType == 1 ) {
    			// Remove style attribute(s) :
    			cur.removeAttribute("style");
    			this.cleanStyles( cur );
    		}
    		cur = cur.nextSibling;
    	}
    },
    killDivs: function ( e ) {
      var divsList = e.getElementsByTagName( "div" );
      var curDivLength = divsList.length;

      // Gather counts for other typical elements embedded within.
      // Traverse backwards so we can remove nodes at the same time without effecting the traversal.
      for (var i=curDivLength-1; i >= 0; i--) {
      	var p = divsList[i].getElementsByTagName("p").length;
      	var img = divsList[i].getElementsByTagName("img").length;
      	var li = divsList[i].getElementsByTagName("li").length;
      	var a = divsList[i].getElementsByTagName("a").length;
      	var embed = divsList[i].getElementsByTagName("embed").length;

      // If the number of commas is less than 10 (bad sign) ...
      if ( this.getCharCount(divsList[i]) < 10) {
      		// And the number of non-paragraph elements is more than paragraphs
      		// or other ominous signs :
      		if ( img > p || li > p || a > p || p == 0 || embed > 0) {
      			divsList[i].parentNode.removeChild(divsList[i]);
      		}
      	}
      }
      return e;
    },
    killBreaks: function ( e ) {
    	e.innerHTML = e.innerHTML.replace(/(<br\s*\/?>(\s|&nbsp;?)*){1,}/g,'<br />');
    	return e;
    },
    clean: function(e, tags, minWords) {
      var targetList = e.getElementsByTagName( tags );
      minWords = minWords || 1000000;

      for (var y=0; y < targetList.length; y++) {
      	// If the text content isn't laden with words, remove the child:
      	if (this.getCharCount(targetList[y], " ") < minWords) {
      		targetList[y].parentNode.removeChild(targetList[y]);
      	}
      }
      return e;
    }
  };
  exports.Client = Client;
})();