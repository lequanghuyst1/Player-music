/*
    1. Render songs
    2. Scroll top
    3. Play / pause / seek
    4. Cd rotate
    5. Next / prev
    6. Random
    7. Next / repeat when ended
    8. Active song
    9. Scroll active song into view
    10. Play song when click
*/

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const log = console.log.bind();

const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const player = $('.player');
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress')
const btnNext = $('.btn-next');
const btnPrev = $('.btn-prev');
const btnRandom = $('.btn-random');
const btnRepeat = $('.btn-repeat');
const playlist = $('.playlist');
const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Trước Khi Em Tồn Tại',
            singer: 'Việt Anh',
            path: './assets/music/song1.mp3',
            image: './assets/images/song1.jpg'
        },
        {
            name: 'Nợ Ai Đó Lời Xin Lỗi',
            singer: 'Bozitt',
            path: './assets/music/song2.mp3',
            image: './assets/images/song2.jpg' 
        },
        {
            name: 'Chẳng Thể Tìm Được Em',
            singer: 'Freak D, Reddy',
            path: './assets/music/song3.mp3',
            image: './assets/images/song3.jpg'
        },
        {
            name: 'Dẫu có lỗi lầm',
            singer: 'Freak D, Reddy',
            path: './assets/music/song4.mp3',
            image: './assets/images/song4.png'
        },
        {
            name: 'Ánh Sao Và Bầu Trời',
            singer: 'T.R.I x Cá',
            path: './assets/music/song5.mp3',
            image: './assets/images/song5.png'
        },
        {
            name: '2T - LIỆU GIỜ( WHAT IF ?)',
            singer: 'Venn ( Prod. KayT ) ',
            path: './assets/music/song6.mp3',
            image: './assets/images/song6.png'
        },
        {
            name: 'W/n - 3107',
            singer: 'W/n - 3107',
            path: './assets/music/song7.mp3',
            image: './assets/images/song7.png'
        },
        {
            name: 'Lan Man',
            singer: 'Lan Man',
            path: './assets/music/song8.mp3',
            image: './assets/images/song8.png'
        },
        {
            name: 'Bao Tiền Một Mớ Bình Yên',
            singer: '14 Casper & Bon Nghiêm ',
            path: './assets/music/song9.mp3',
            image: './assets/images/song9.png'
        },
        {
            name: 'Lạ Lùng',
            singer: 'Vũ',
            path: './assets/music/song10.mp3',
            image: './assets/images/song10.png'
        },
    ],
    setConfig: function(key,value){
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function(){
        const htmls = this.songs.map((song, index)=>{
            return`
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index = ${index}>
                <div class="thumb" style="background-image: url('${song.image}')"></div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        })
        playlist.innerHTML = htmls.join('');
    },
    defineProperties: function(){
        Object.defineProperty(this, 'currentSong', {
            get: function(){
                return this.songs[this.currentIndex];
            }
        })
    },
    handleEvents: function(){
        const cdWidth = cd.offsetWidth;
        const _this = this;

        //Xử lý Cd quay và dừng
        const cdThumbAnimate = cdThumb.animate(
            [
                { transform: 'rotate(360deg)'}
            ], 
            {
                duration: 10000, // thời gian quay
                iterations: Infinity
            }
        )
        cdThumbAnimate.pause();

        //Xử lý phóng to thu nhỏ CD
        document.onscroll = function(){
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            // if(scrollTop < 0){
            //     scrollTop = 0; 
            //     cd.style.width = newCdWidth +'px';
            // }
            // else{
            //     cd.style.width = newCdWidth +'px';
            // }
            cd.style.width = newCdWidth > 0 ?  newCdWidth+'px' :0;
            cd.style.opacity = newCdWidth / cdWidth;
        }
        //Xử lý khi click play
        playBtn.onclick = function(){
            if(_this.isPlaying){
                audio.pause();
            }
            else{
                audio.play();
            }
        }

        //Khi song được play
        audio.onplay = function(){
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        //Khi song bị pase
        audio.onpause = function(){
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }
        
        //Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function(){
            if(audio.duration){
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
            }
        }

        //Xử lý khi tua song
        progress.onchange = function(e){
            const seekTime = e.target.value * audio.duration / 100;
            audio.currentTime = seekTime;
        }

        //Xử lý next song
        btnNext.onclick = function(){
            if(_this.isRandom){
                _this.playRandomSong();
            }
            else{
                log(_this.isRandom)
                _this.nextSong();
            }

            audio.play();
            _this.render();
            _this.scrollActiveSong();
        }
        
        //Xử lý prev song
        btnPrev.onclick = function(){
            _this.prevSong();
            _this.render();
            _this.scrollActiveSong();
            
        }

        //Xứ lý bật tắt random
        btnRandom.onclick = function(){
            // if(_this.isRandom){
            //     btnRandom.classList.remove('active');
            //     _this.isRandom = false;
            // }
            // else{
            //     _this.isRandom = true;
            //     btnRandom.classList.add('active');
            // }
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom',_this.isRandom);
            btnRandom.classList.toggle('active',_this.isRandom);
        }

        //Xử lý lặp lại một song
        btnRepeat.onclick = function(e){
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat',_this.isRepeat);
            btnRepeat.classList.toggle('active',_this.isRepeat)

        }

        //Xử lí next khi xong audioended
        audio.onended = function(){
            if(_this.isRepeat){
                audio.play()
            }
            else{
                btnNext.click();
            }
        }

        //Lắng nghe hành vi vào playlist
        playlist.onclick = function(e){
            const songNode = e.target.closest('.song:not(.active)');
            if(songNode || e.target.closest('.option')){
                //Xử lý khi click vào song
                if(songNode){
                    //log(songNode.getAttribute('data-index'))
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play()

                }
                //Xử lý khi click vào song option
                if(e.target.closest('.option')){

                }
            }
            else{

            }
        }
        
    },
    scrollActiveSong: function(){
        setTimeout(()=>{
            $('.song.active').scrollIntoView(
                {
                    behavior: 'smooth',
                    block: 'center'
                }
            )
        },300)
    },
    loadCurrentSong: function(){
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path;
    },
    nextSong: function(){
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length){
            this.currentIndex =0;
        }
        this.loadCurrentSong();
    },
    prevSong: function(){
        this.currentIndex--;
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length-1;
        }
        this.loadCurrentSong();
    },
    playRandomSong: function(){
        var arrListPlaySong = [];
        let newIndex;
        // for(var i=0;i<this.songs.length;i++){
        //     if(i != this.currentIndex && arrListPlaySong.find(value => value!=newIndex)){
        //         newIndex = Math.floor(Math.random()*this.songs.length);
        //         arrListPlaySong.push(newIndex);
        //     }
        // }
        do{
            newIndex = Math.floor(Math.random()*this.songs.length)
        } 
        while(newIndex === this.currentIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    start: function(){
        //Định nghĩa các thuộc tính cho Object
        this.defineProperties();

        //Lắng nghe / xử lý các sự kiện
        this.handleEvents()

        //Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong();


        this.render()
    }
}

app.start();