function ads_wide(id) {
    const html = `
<!-- 横長ディスプレイ広告 -->
<div style="margin-top:20px">
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-5605897321593790"
     data-ad-slot="1084207918"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
</div>
`;

    const target = document.getElementById(id);
    if (!target) {
        return;
    }

    target.innerHTML = html;
    (adsbygoogle = window.adsbygoogle || []).push({});
}

function ads_infeed(id) {
    const html = `
<ins class="adsbygoogle"
     style="display:block"
     data-ad-format="fluid"
     data-ad-layout-key="-hl+7-z-2d+86"
     data-ad-client="ca-pub-5605897321593790"
     data-ad-slot="2566021993"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
`;

    const target = document.getElementById(id);
    if (!target) {
        return;
    }

    target.innerHTML = html;
    (adsbygoogle = window.adsbygoogle || []).push({});
}

