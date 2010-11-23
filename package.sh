NAME=node-readability
tar -zcf ./dist/readability.tgz -C .. --exclude=".*" --exclude="test*" $NAME/lib $NAME/LICENSE.txt $NAME/README.md $NAME/package.json