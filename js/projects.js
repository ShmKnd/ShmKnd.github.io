/* ── Project data registry ──
   Edit this file to update project content.
   Each entry: title, images[], summary, note, note2, background, background_en,
   process: { context, approach, result }, links[]
*/
window.PROJECTS = {
  'lyrics-sync': {
    title: 'Automated Lyrics Sync System',
    images: [
      'Assets/LyricsSystem/LyricsSystem-1.webp',
      'Assets/LyricsSystem/LyricsSystem-2.webp',
      'Assets/LyricsSystem/LyricsSystem-3.webp'
    ],
    summary: 'CSV-based real-time lyric rendering via MIDI CC. Handles timed lyric display synced to music playback using TouchDesigner and MIDI control change messages.',
    note: 'TouchDesigner, Python, CSV, MIDI, AudioHardware',
    background: '',
    background_en: '',
    process: {
      context: 'DAW同期を用いるアーティストから、歌詞をプロジェクターに投影したいという要望があった。オーディオのハードウェアルーティングおよびDAWプロジェクトは既に完成しており、動画ファイルを組み込む構成は取れなかった。当初はVDMXを検討したが、DAWと同時起動すると不安定になり、オーディオI/Oとの干渉によるノイズも発生したため、TouchDesignerを選定した。',
      approach: `DAWからシーケンスに沿ったMIDI CCを送出し、IAC経由でTouchDesignerへ転送した。
      
      MIDI NoteではなくMIDI CCを採用したのは、チャンネル・CC番号・値のみで構成されており扱いやすいためである。チャンネルは1、CC番号は汎用使用を避けて2に設定した。

    歌詞はCSV形式に整形し、TouchDesignerでTable DATとして読み込んだ。複数曲分を事前にロードし、Table DAT Switchで切り替える構成とした。各テーブルには「index CC値」「歌詞テキスト」「スケール倍率」を持たせ、Text TOPで描画した。

MIDI CCの値変化をTrigger CHOPで検出し、イーズやグローなどのポストエフェクトを加えた。生成した歌詞ピクセルは複製してScreen合成し、色調補正を行うことで単調さを抑えた。将来的なVJ運用を想定し、インタラクティブなポストエフェクトと複数の背景モードも実装した。出力はTouchDesignerのView機能を用いた。`,
      result: ''
    },
    links: []
  },
  'ai-visual': {
    title: 'AI-Driven Visual Objects',
    images: [
      'Assets/Python/DepthEstimate.webp',
      'Assets/Python/YOLO.webp'
    ],
    summary: 'Custom TouchDesigner components for Depth Estimation and YOLO-based object detection using Python. Generates real-time visual layers from camera input.',
    note: 'Python, TouchDesigner, PyTorch, YOLO26,ONNX Runtime',
    background: '',
    background_en: '',
    process: {
      context: 'Surveyed model tradeoffs and runtime constraints; prioritized lightweight, real-time-capable networks suitable for live camera input.',
      approach: 'Prototyped depth estimation (MiDaS-like) for layered parallax compositing. Integrated YOLO-based detection converted to ONNX and mapped detections to visual overlays and control channels. Optimized inference using ONNX Runtime (FP16) and batched pre/post-processing to stabilize framerate.',
      result: 'Real-time layered visual outputs for TouchDesigner with robust detection fallbacks and consistent runtime performance.'
    },
    links: []
  },
  'glsl-shaders': {
    title: 'GLSL Shader Collection',
    images: [
      'Assets/GLSL/OpticalDistort.webp',
      'Assets/GLSL/SimpleVoronoi_2.webp',
      'Assets/GLSL/Lumetri.webp',
      'Assets/GLSL/Pixelation.webp',
      'Assets/GLSL/Lightburst.webp',
      'Assets/GLSL/DivideCell.webp',
      'Assets/GLSL/ChromaticAberration.webp'
    ],
    summary: 'Designed and developed a suite of custom GLSL shaders for TouchDesigner, including Voronoi noise, ACES tone mapping, pixelation, and a range of additional procedural and post-processing effects.',
    note: 'GLSL, TouchDesigner',
    background: '',
    background_en: '',
    process: { context: '', approach: '', result: '' },
    links: []
  },
  'echogentleman': {
    title: 'EchoGentleMan',
    images: ['Assets/EchoGentleMan.webp'],
    summary: 'High-precision Analog BBD Delay plugin. Modeled after classic bucket-brigade circuits with modern DSP accuracy.',
    note: 'C++, JUCE, AudioUnit, VST3',
    note2: '5 months development',
    background: '既存のアナログディレイ・プラグインは、ギタリスト向けのシンプルだがモノラルなものか、エンジニア向けの多機能だが複雑すぎるものの二極化が進んでいました。EchoGentleManは、Strymon TIMELINEのような直感的な操作性と、現代的なステレオ処理の精密さを両立させたプロダクトです。JUCEとC++を用い、SIMDによる高速化を施すことで、音楽的な「旨味」とデジタル特有の利便性を一つのパッケージに凝縮しました。',
    background_en: 'Most analog delay plugins are either too simplistic for engineers or too complex for guitarists. EchoGentleMan bridges this gap, inspired by the intuitive yet precise philosophy of the Strymon TIMELINE. Developed with JUCE and C++, and optimized with SIMD, it delivers high-fidelity stereo processing with the effortless workflow of a classic hardware pedal.',
    process: { context: '', approach: '', result: '' },
    links: [{ label: 'Payhip', url: 'https://payhip.com/b/XqglK' }]
  },
  'master-level-meter': {
    title: 'MasterLevelMeter',
    images: ['Assets/MasterLevelMeter.webp'],
    summary: 'Integrated master bus monitoring plugin for OBS. Provides real-time loudness and peak metering inside the streaming workflow.',
    note: 'C++, Qt6, OBS Plugin API',
    note2: '3 months development',
    background: 'OBS Studioには標準で最終出力を監視するマスターバスが存在しないため、配信全体の音量バランスを正確に把握することが困難でした。この課題を解決するため、トラック1〜6のレベルを統合的に監視し、Peak/RMSに加えて放送基準のLUFS値をリアルタイムで表示するプラグインを開発しました。AIとの共同開発により、仕様策定から2ヶ月という短期間でユニバーサルバイナリ化とGitHubでの公開を実現しています。',
    background_en: 'OBS Studio lacks a native master bus, making it difficult to maintain consistent volume levels across a stream. To address this, I developed a plugin that monitors all six tracks simultaneously, providing real-time Peak, RMS, and LUFS visualization. By leveraging AI-assisted coding, I moved from specification to a cross-platform GitHub release within just two months.',
    process: { context: '', approach: '', result: '' },
    links: [{ label: 'GitHub', url: 'https://github.com/ShmKnd/MasterLevelMeter' }]
  },
  'audio-inspector': {
    title: 'Audio Inspector',
    images: [
      'Assets/AudioInspector-1.webp',
      'Assets/AudioInspector-2.webp',
      'Assets/AudioInspector-3.webp',
      'Assets/AudioInspector-4.webp'
    ],
    summary: 'Visualizes global and per-source audio signal paths inside OBS, aiding in complex routing and debugging.',
    note: 'C++, Qt6, OBS Plugin API',
    note2: '1 months of development',
    background: '複雑なOBSの音声ルーティングにおいて、初学者がトラブルの原因を特定するのは容易ではありません。また、熟練者にとっても設定の階層を辿る作業は非効率です。そこで、全音声デバイスの状態をワンクリックで診断し、状況をJSON形式のマップとしてエクスポートできるツールを構築しました。これにより、トラブルシューティングの即応性を高め、他者へのサポートも容易にする仕組みを提供しています。',
    background_en: "Navigating OBS's complex audio routing can be daunting for beginners and tedious for professionals. I built this diagnostic tool to simplify the process by generating a comprehensive JSON map of all audio device states with a single click. This significantly speeds up troubleshooting and makes it easier for users to seek or provide remote technical support.",
    process: { context: '', approach: '', result: '' },
    links: [{ label: 'GitHub', url: 'https://github.com/ShmKnd/AudioInspector' }]
  },
  'buttersync': {
    title: 'ButterSync',
    images: ['Assets/ButterSync.webp'],
    summary: 'Redundant DAW sync system with MTC Freewheel logic. Ensures stable timecode sync across multiple applications.',
    note: 'Swift, CoreMIDI, Interface Builder',
    note2: '3 months of development',
    background: 'ライブ演出の現場では、DAWを2台体制にする冗長化が一般的ですが、高価なハードウェアなしに「マスターが止まってもバックアップが止まらない（Jamシンク）」環境を構築するのは困難でした。ButterSyncは、MTC信号を監視し、信号途絶時に瞬時に内部時計によるフリーランへと切り替えるロジックをソフトウェアで実装しました。CoreMIDIとC++を駆使し、現場の「止まれない」要求に応える信頼性を実現しています。',
    background_en: 'In live show environments, achieving robust DAW redundancy without expensive hardware remains a challenge. ButterSync solves this by implementing "Jam-sync" logic via software, monitoring the MTC signal and instantly switching to an internal freewheeling clock if the master fails. Built with CoreMIDI and C++, it ensures seamless synchronization for mission-critical performances.',
    process: { context: '', approach: '', result: '' },
    links: []
  },
  'image-captioner': {
    title: 'Image Captioner',
    images: [
      'Assets/ImageCaptioner/ImageCaptioner-1.webp',
      'Assets/ImageCaptioner/ImageCaptioner-2.webp',
      'Assets/ImageCaptioner/ImageCaptioner-3.webp',
      'Assets/ImageCaptioner/imgcpt_demo00001.webp',
      'Assets/ImageCaptioner/imgcpt_demo00002.webp',
      'Assets/ImageCaptioner/imgcpt_demo00003.webp',
      'Assets/ImageCaptioner/imgcpt_demo00004.webp'
    ],
    summary: 'Batch image processor with Saliency-based cropping. Automatically generates descriptive captions for large image sets.',
    note: 'Swift, CoreImage, CoreGraphics, Interface Builder, OpenCV',
    note2: '3 months of development',
    background: 'インスタグラム投稿用の画像編集において、正方形へのトリミングやEXIF情報の文字入れは、手動で行うにはあまりに反復的な作業です。このアプリは、OpenCVのサリエンシー解析を用いて写真の「注目点」を自動で中央に配置し、さらに背景の明度を判別してEXIFのフォント色を自動調整するインテリジェンスを備えています。Swiftによるネイティブ実装で、大量の画像もバッチ処理で瞬時に最適化することが可能です。',
    background_en: 'Preparing photos for Instagram—cropping to squares and adding EXIF metadata—is often a repetitive chore. This macOS native app automates the process using OpenCV saliency analysis to keep the visual focus centered, while intelligently adjusting font colors based on background luminosity. Built with Swift, it provides a high-speed batch workflow that allows creators to spend more time shooting and less time editing.',
    process: { context: '', approach: '', result: '' },
    links: []
  }
};
