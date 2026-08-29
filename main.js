const SUPABASE_URL =
    "https://fmqjevqagtasqpeezwnn.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_Me5hyK-zIp3_5yBpHP8VVA_OFk2bqSj";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ======================================================
// ПОЛУЧАЕМ ПОСЛЕДНИЕ ПУБЛИКАЦИИ
// ======================================================

async function loadLatestPosts() {

    const {
        data,
        error
    } = await supabaseClient
        .from("posts")
        .select("*")
        .eq("published", true)
        .order("created_at", {
            ascending: false
        })
        .limit(4);


    if (error) {

        console.error(
            "Ошибка загрузки публикаций:",
            error
        );

        return;
    }


    if (!data || data.length === 0) {

        console.log(
            "Опубликованных публикаций пока нет."
        );

        return;
    }


    // ==================================================
    // ГЛАВНАЯ ПУБЛИКАЦИЯ
    // ==================================================

    const mainPost = data[0];


    const mainTitle =
        document.querySelector(
            ".article h2"
        );


    const mainDate =
        document.querySelector(
            ".article .date"
        );


    const mainDescription =
        document.querySelectorAll(
            ".article p"
        );


    const mainMedia =
        document.querySelector(
            ".main-photo"
        );


    if (mainTitle) {

        mainTitle.textContent =
            mainPost.title ||
            "Без названия";

    }


    if (mainDate) {

        mainDate.textContent =
            formatDate(
                mainPost.created_at
            );

    }


    if (mainDescription.length > 0) {

        mainDescription[0].textContent =
            createDescription(
                mainPost.content
            );

    }


    if (mainDescription.length > 1) {

        mainDescription[1].textContent =
            "Опубликовано на новостном портале Богаева М. Е.";

    }


    if (mainMedia) {

        renderMedia(
            mainMedia,
            mainPost,
            true
        );

    }


    // ==================================================
    // КНОПКА ГЛАВНОЙ ПУБЛИКАЦИИ
    // ==================================================

    const mainReadMore =
        document.querySelector(
            ".article .read-more"
        );


    if (mainReadMore) {

        mainReadMore.href =
            "news-post.html?id=" +
            encodeURIComponent(
                mainPost.id
            );

        mainReadMore.textContent =
            "Читать полностью →";

    }


    // ==================================================
    // ПОСЛЕДНИЕ МАТЕРИАЛЫ
    // ==================================================

    const cards =
        document.querySelector(
            ".cards"
        );


    if (!cards) {

        return;

    }


    cards.innerHTML = "";


    data.forEach(function(post) {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "card";


        const media =
            document.createElement(
                "div"
            );


        media.className =
            "card-photo";


        renderMedia(
            media,
            post,
            false
        );


        const title =
            document.createElement(
                "h3"
            );


        title.textContent =
            post.title ||
            "Без названия";


        const description =
            document.createElement(
                "p"
            );

        /* V2: отдельный класс только для превью текста */
        description.className =
            "post-preview";

        description.textContent =
            createDescription(
                post.content
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            "news-post.html?id=" +
            encodeURIComponent(
                post.id
            );


        // У видео вообще нет нижней кнопки

        if (isVideoPost(post)) {

            link.textContent = "";

        } else {

            link.textContent =
                "Читать →";

        }


        card.appendChild(
            media
        );

        card.appendChild(
            title
        );

        card.appendChild(
            description
        );


        if (!isVideoPost(post)) {

            card.appendChild(
                link
            );

        }


        cards.appendChild(
            card
        );

    });

}



// ======================================================
// ПРОВЕРКА НА ВИДЕО
// ======================================================

function isVideoPost(post) {

    if (!post) {

        return false;

    }


    if (
        post.video_url &&
        String(
            post.video_url
        ).trim() !== ""
    ) {

        return true;

    }


    const category =
        String(
            post.category || ""
        ).toLowerCase();


    if (
        category === "video" ||
        category === "videos" ||
        category === "видео"
    ) {

        return true;

    }


    return false;

}



// ======================================================
// ОТОБРАЖЕНИЕ МЕДИА
// ======================================================

function renderMedia(
    container,
    post,
    isMain
) {

    if (!container) {

        return;

    }


    container.innerHTML = "";


    // ==================================================
    // ВИДЕО
    // ==================================================

    if (isVideoPost(post)) {


        if (
            !post.video_url ||
            String(
                post.video_url
            ).trim() === ""
        ) {

            const error =
                document.createElement(
                    "div"
                );


            error.className =
                "media-error";


            error.textContent =
                "ВИДЕО НЕ НАЙДЕНО";


            container.appendChild(
                error
            );


            return;

        }


        const video =
            document.createElement(
                "video"
            );


        video.src =
            String(
                post.video_url
            ).trim();


        video.controls =
            true;


        video.preload =
            "metadata";


        video.playsInline =
            true;


        video.className =
            isMain
                ? "main-video"
                : "card-video";


        if (
            post.image_url &&
            String(
                post.image_url
            ).trim() !== ""
        ) {

            video.poster =
                String(
                    post.image_url
                ).trim();

        }


        container.appendChild(
            video
        );


        // ==================================================
        // PLAY-КНОПКА ТОЛЬКО НА ГЛАВНОМ ВИДЕО
        // ==================================================

        if (isMain) {

            container.style.position =
                "relative";


            const playButton =
                document.createElement(
                    "button"
                );


            playButton.type =
                "button";


            playButton.className =
                "media-play-button";


            playButton.innerHTML =
                "";


            playButton.setAttribute(
                "aria-label",
                "Воспроизвести видео"
            );


            playButton.addEventListener(
                "click",
                async function(event) {

                    event.preventDefault();
                    event.stopPropagation();


                    try {

                        await video.play();

                        playButton.classList.add(
                            "hidden"
                        );

                    } catch (error) {

                        console.error(
                            "Не удалось запустить видео:",
                            error
                        );

                    }

                }
            );


            video.addEventListener(
                "play",
                function() {

                    playButton.classList.add(
                        "hidden"
                    );

                }
            );


            video.addEventListener(
                "pause",
                function() {

                    playButton.classList.remove(
                        "hidden"
                    );

                }
            );


            video.addEventListener(
                "ended",
                function() {

                    playButton.classList.remove(
                        "hidden"
                    );

                }
            );


            container.appendChild(
                playButton
            );

        }


        return;

    }



    // ==================================================
    // ФОТО
    // ==================================================

    if (
        post.image_url &&
        String(
            post.image_url
        ).trim() !== ""
    ) {

        const img =
            document.createElement(
                "img"
            );


        img.src =
            String(
                post.image_url
            ).trim();


        img.alt =
            post.title ||
            "Фотография публикации";


        img.loading =
            "lazy";


        img.className =
            isMain
                ? "main-image"
                : "card-image";


        container.appendChild(
            img
        );


        return;

    }



    // ==================================================
    // НЕТ МЕДИА
    // ==================================================

    const span =
        document.createElement(
            "span"
        );


    span.textContent =
        "МЕДИА НЕТ";


    container.appendChild(
        span
    );

}



// ======================================================
// КОРОТКОЕ ОПИСАНИЕ
// ======================================================

function createDescription(
    text
) {

    if (!text) {

        return "Без описания.";

    }


    const cleanText =
        String(text)
            .replace(
                /\s+/g,
                " "
            )
            .trim();


    if (
        cleanText.length <= 150
    ) {

        return cleanText;

    }


    return (
        cleanText.substring(
            0,
            150
        ) +
        "..."
    );

}



// ======================================================
// ФОРМАТ ДАТЫ
// ======================================================

function formatDate(
    dateString
) {

    if (!dateString) {

        return "Дата неизвестна";

    }


    return new Date(
        dateString
    ).toLocaleString(
        "ru-RU",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",

            hour: "2-digit",
            minute: "2-digit"
        }
    );

}



// ======================================================
// ЗАПУСК
// ======================================================

loadLatestPosts();

/* ============================================================
   🔒 ГЛОБАЛЬНАЯ БЛОКИРОВКА САЙТА
   ДОБАВЛЕНО В КОНЕЦ main.js
   СУЩЕСТВУЮЩИЕ СТРОКИ ВЫШЕ НЕ ИЗМЕНЯЕМ
   ============================================================ */

(function () {

    let globalBanPunishment = null;

    function globalBanAddStyles() {

        if (
            document.getElementById(
                "global-site-ban-styles"
            )
        ) {
            return;
        }

        const style =
            document.createElement("style");

        style.id =
            "global-site-ban-styles";

        style.textContent = `
            #global-site-ban-overlay {
                position: fixed;
                inset: 0;
                z-index: 2147483647;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 24px;
                box-sizing: border-box;
                background: rgba(0, 0, 0, .72);
                backdrop-filter: blur(3px);
                -webkit-backdrop-filter: blur(3px);
            }

            .global-site-ban-window {
                width: min(560px, 100%);
                max-height: calc(100vh - 48px);
                overflow-y: auto;
                box-sizing: border-box;
                padding: 26px 28px 24px;
                border-radius: 18px;
                border: 1px solid rgba(255,255,255,.16);
                background: rgba(22,22,22,.95);
                color: #fff;
                box-shadow:
                    0 18px 60px rgba(0,0,0,.5);
                font-family: Arial, sans-serif;
            }

            .global-site-ban-title {
                margin: 0 0 20px;
                font-size: 23px;
                line-height: 1.3;
                font-weight: 700;
                color: #ff5a36;
            }

            .global-site-ban-table {
                width: 100%;
                border-collapse: collapse;
                margin: 0 0 20px;
            }

            .global-site-ban-table th,
            .global-site-ban-table td {
                padding: 10px 12px;
                border-bottom:
                    1px solid rgba(255,255,255,.14);
                text-align: left;
                vertical-align: top;
            }

            .global-site-ban-table th {
                width: 220px;
                color: #cfcfcf;
                font-weight: 600;
            }

            .global-site-ban-table td {
                color: #fff;
                word-break: break-word;
            }

            .global-site-ban-countdown {
                color: #ff6a43;
                font-weight: 700;
            }

            .global-site-ban-support {
                padding-top: 16px;
                border-top:
                    1px solid rgba(255,255,255,.14);
                font-size: 14px;
                line-height: 1.55;
            }

            .global-site-ban-support a {
                color: #ff6a43;
                font-weight: 700;
            }

            .global-site-ban-close {
                display: block;
                min-width: 150px;
                margin: 22px auto 0;
                padding: 12px 24px;
                border: 0;
                border-radius: 999px;
                background: #f4511e;
                color: #fff;
                font-size: 15px;
                font-weight: 700;
                cursor: pointer;
            }

            .global-site-ban-close:hover {
                background: #e04414;
            }

            body.global-site-ban-active {
                overflow: hidden !important;
            }

            @media (max-width: 600px) {

                #global-site-ban-overlay {
                    padding: 14px;
                }

                .global-site-ban-window {
                    max-height:
                        calc(100vh - 28px);
                    padding: 22px 18px;
                    border-radius: 14px;
                }

                .global-site-ban-title {
                    font-size: 20px;
                }

                .global-site-ban-table th,
                .global-site-ban-table td {
                    display: block;
                    width: auto;
                    border-bottom: 0;
                    padding: 6px 8px;
                }

                .global-site-ban-table tr {
                    display: block;
                    padding: 5px 0;
                    border-bottom:
                        1px solid rgba(255,255,255,.14);
                }
            }
        `;

        document.head.appendChild(style);
    }

    function globalBanEscape(value) {

        const div =
            document.createElement("div");

        div.textContent =
            value === null ||
            value === undefined
                ? ""
                : String(value);

        return div.innerHTML;
    }

    function globalBanFormatDate(value) {

        if (!value) {
            return "—";
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "—";
        }

        return date.toLocaleString(
            "ru-RU",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    }

    function globalBanFormatRemaining(value) {

        if (!value) {
            return "Никогда";
        }

        const remaining =
            new Date(value).getTime() -
            Date.now();

        if (remaining <= 0) {
            return "Блокировка закончилась";
        }

        let totalSeconds =
            Math.floor(
                remaining / 1000
            );

        const days =
            Math.floor(
                totalSeconds / 86400
            );

        totalSeconds %= 86400;

        const hours =
            Math.floor(
                totalSeconds / 3600
            );

        totalSeconds %= 3600;

        const minutes =
            Math.floor(
                totalSeconds / 60
            );

        const seconds =
            totalSeconds % 60;

        const parts = [];

        if (days) {
            parts.push(
                days + " д"
            );
        }

        if (hours || days) {
            parts.push(
                hours + " ч"
            );
        }

        parts.push(
            minutes + " мин"
        );

        parts.push(
            seconds
                .toString()
                .padStart(2, "0") +
            " сек"
        );

        return parts.join(" ");
    }

    function globalBanFormatDuration(
        issuedAt,
        expiresAt
    ) {

        if (
            !issuedAt ||
            !expiresAt
        ) {
            return "Никогда";
        }

        const from =
            new Date(
                issuedAt
            ).getTime();

        const to =
            new Date(
                expiresAt
            ).getTime();

        if (
            !Number.isFinite(from) ||
            !Number.isFinite(to) ||
            to <= from
        ) {
            return "—";
        }

        return (
            Math.ceil(
                (to - from) /
                60000
            ) +
            " мин"
        );
    }

    function globalBanIsActive(
        punishment
    ) {

        if (!punishment) {
            return false;
        }

        const type =
            String(
                punishment.punishment_type ||
                ""
            ).toLowerCase();

        if (
            type !== "ban" &&
            type !== "temporary_ban"
        ) {
            return false;
        }

        if (
            !punishment.expires_at
        ) {
            return true;
        }

        return (
            new Date(
                punishment.expires_at
            ).getTime() >
            Date.now()
        );
    }

    function globalBanShow(
        punishment
    ) {

        globalBanAddStyles();

        const old =
            document.getElementById(
                "global-site-ban-overlay"
            );

        if (old) {
            old.remove();
        }

        const temporary =
            Boolean(
                punishment.expires_at
            );

        const title =
            temporary
                ? "🚫 Вы были временно заблокированы на сайте."
                : "🚫 Вы были заблокированы на сайте.";

        const duration =
            temporary
                ? globalBanFormatDuration(
                    punishment.issued_at,
                    punishment.expires_at
                )
                : "Навсегда";

        const releaseDate =
            temporary
                ? globalBanFormatDate(
                    punishment.expires_at
                )
                : "Никогда";

        const overlay =
            document.createElement(
                "div"
            );

        overlay.id =
            "global-site-ban-overlay";

        overlay.innerHTML = `
            <div
                class="global-site-ban-window"
                role="alertdialog"
                aria-modal="true"
            >

                <div
                    class="global-site-ban-title"
                >
                    ${title}
                    <br>
                    Администратором / Модератором.
                </div>

                <table
                    class="global-site-ban-table"
                >
                    <tbody>

                        <tr>
                            <th>Причина:</th>
                            <td>
                                ${globalBanEscape(
                                    punishment.reason ||
                                    "Не указана"
                                )}
                            </td>
                        </tr>

                        <tr>
                            <th>
                                Дата выдачи наказания:
                            </th>
                            <td>
                                ${globalBanEscape(
                                    globalBanFormatDate(
                                        punishment.issued_at
                                    )
                                )}
                            </td>
                        </tr>

                        <tr>
                            <th>
                                Срок наказания:
                            </th>
                            <td>
                                ${globalBanEscape(
                                    duration
                                )}
                            </td>
                        </tr>

                        <tr>
                            <th>
                                Время / Дата снятия наказания:
                            </th>
                            <td>
                                ${globalBanEscape(
                                    releaseDate
                                )}
                            </td>
                        </tr>

                        ${
                            temporary
                                ? `
                                    <tr>
                                        <th>
                                            ⏱ Осталось:
                                        </th>
                                        <td>
                                            <strong
                                                id="global-site-ban-countdown"
                                                class="global-site-ban-countdown"
                                            >
                                                ${globalBanEscape(
                                                    globalBanFormatRemaining(
                                                        punishment.expires_at
                                                    )
                                                )}
                                            </strong>
                                        </td>
                                    </tr>
                                  `
                                : ""
                        }

                    </tbody>
                </table>

                <div
                    class="global-site-ban-support"
                >
                    <strong>
                        Не согласны с решением
                        Администратора / модератора?
                    </strong>

                    <br>

                    Служба поддержки:
                    <a href="about.html">
                        обратиться в службу поддержки
                    </a>
                </div>

                <button
                    type="button"
                    id="global-site-ban-close"
                    class="global-site-ban-close"
                >
                    Закрыть
                </button>

            </div>
        `;

        document.body.appendChild(
            overlay
        );

        document.body.classList.add(
            "global-site-ban-active"
        );

        const closeButton =
            document.getElementById(
                "global-site-ban-close"
            );

        if (closeButton) {

            closeButton.addEventListener(
                "click",
                function () {

                    overlay.style.display =
                        "none";

                    setTimeout(
                        function () {

                            if (
                                globalBanPunishment &&
                                globalBanIsActive(
                                    globalBanPunishment
                                )
                            ) {
                                overlay.style.display =
                                    "flex";
                            }

                        },
                        50
                    );
                }
            );
        }
    }

    function globalBanUpdate() {

        if (
            !globalBanPunishment
        ) {
            return;
        }

        if (
            !globalBanPunishment.expires_at
        ) {
            return;
        }

        const expiresTime =
            new Date(
                globalBanPunishment.expires_at
            ).getTime();

        if (
            !Number.isFinite(
                expiresTime
            )
        ) {
            return;
        }

        if (
            expiresTime <=
            Date.now()
        ) {

            globalBanPunishment =
                null;

            const overlay =
                document.getElementById(
                    "global-site-ban-overlay"
                );

            if (overlay) {
                overlay.remove();
            }

            document.body.classList.remove(
                "global-site-ban-active"
            );

            return;
        }

        const countdown =
            document.getElementById(
                "global-site-ban-countdown"
            );

        if (countdown) {

            countdown.textContent =
                globalBanFormatRemaining(
                    globalBanPunishment.expires_at
                );
        }
    }

    async function globalBanCheck() {

        try {

            const {
                data: sessionData,
                error: sessionError
            } =
                await supabaseClient.auth.getSession();

            if (sessionError) {

                console.error(
                    "Ошибка получения сессии для глобального бана:",
                    sessionError
                );

                return;
            }

            let currentUser = null;

            if (
                sessionData &&
                sessionData.session &&
                sessionData.session.user
            ) {

                currentUser =
                    sessionData.session.user;

            } else {

                const {
                    data,
                    error
                } =
                    await supabaseClient.auth
                        .signInAnonymously();

                if (error) {

                    console.error(
                        "Ошибка анонимной авторизации для глобального бана:",
                        error
                    );

                    return;
                }

                currentUser =
                    data.user;
            }

            if (!currentUser) {
                return;
            }

            const {
                data,
                error
            } =
                await supabaseClient.rpc(
                    "get_active_user_punishment",
                    {
                        target_user_id:
                            currentUser.id
                    }
                );

            if (error) {

                console.error(
                    "Ошибка проверки глобального бана:",
                    error
                );

                return;
            }

            let punishment = null;

            if (
                Array.isArray(data)
            ) {

                punishment =
                    data.find(
                        function (item) {

                            return (
                                item &&
                                (
                                    item.punishment_type ===
                                        "ban" ||
                                    item.punishment_type ===
                                        "temporary_ban"
                                ) &&
                                globalBanIsActive(
                                    item
                                )
                            );

                        }
                    ) || null;

            } else if (
                data &&
                globalBanIsActive(data)
            ) {

                punishment =
                    data;
            }

            if (!punishment) {
                return;
            }

            globalBanPunishment =
                punishment;

            globalBanShow(
                punishment
            );

            globalBanUpdate();

        } catch (error) {

            console.error(
                "Ошибка глобальной проверки бана:",
                error
            );
        }
    }

    function globalBanStart() {

        if (
            typeof supabaseClient ===
            "undefined"
        ) {

            console.error(
                "Глобальный бан: supabaseClient не найден."
            );

            return;
        }

        globalBanCheck();

        setInterval(
            globalBanUpdate,
            1000
        );
    }

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            globalBanStart,
            {
                once: true
            }
        );

    } else {

        globalBanStart();
    }

})();