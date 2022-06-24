# npm version patch
version=`node -e 'console.log(require("./package.json").version)'`
echo "version $version"

URL_VER=${version//[.]//}
echo 'URL_VER: ---->'$URL_VER

if [ "$version" != "" ]; then
    git tag -a "$version" -m "`git log -1 --format=%s`"
    echo "Created a new tag, $version"
    git push remoteTiledesk--tags
    npm publish
fi

