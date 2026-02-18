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
      result: 'DAWと同期した、柔軟なリアルタイム歌詞描画を実現した。CSVベースの構造化により拡張性を確保し、インタラクティブな運用にも対応可能な設計とした。将来的な拡張性も考慮し、複数曲の管理や多様なエフェクトの追加も容易な構成となっている。'
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
      context: 'TouchDesigner 2025でPython環境の構築が容易になった。過去にMac環境でPython連携を試したが、デフォルトPythonの仕様により安定しなかった経緯がある。2025環境であれば改善している可能性があると考え、自主制作として検証を行った。TouchDesignerには標準でDepth Estimationを行うオブジェクトが存在しないため、自作する必要があった。SegmentationについてはBlobベースの機能はあるが、より汎用的かつ拡張可能な構成をPythonで試したかった。',
      approach: '実装自体はAIコーディングを活用した。ただし、SegmentationモデルかDetectionモデルか、ONNXかPyTorchかといった理解が浅かったために、ライブラリ仕様やモデル構造の理解を進めながら構築した。速度面ではONNXが有利で、1280×720で60fpsを維持できることを確認した。一方で今回はクオリティを優先し、あえてPyTorch+MPSを選択して実装した。',
      result: 'Depth EstimationおよびSegmentationをTouchDesigner内で扱うコンポーネントを構築した。同時に、Python上でのAIモデルの扱い方に対する理解を深める実践的な学習となった。一方で、1280×720でもリアルタイム動作時に60fpsを下回る場合があり、MacBook Pro 2023 M3環境におけるボトルネックの切り分け（マシンスペック、OS、GPUアーキテクチャの差異など）が今後の課題である。'
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
    process: {
      context: 'TouchDesignerにはGLSLを記述できるオブジェクトがある。以前から挑戦したいと考えていたが、GLSLの知識がなかったため、まず基礎的なリサーチを行った。既存のISFやGLSLコードを参照し、それらをAIに読み込ませて移植・実装を試みた。',
      approach: '初期段階では、TouchDesigner特有のGLSL記述ルールやパラメータ処理の違いにより、すぐに動作するものは少なかった。しかし移植と検証を繰り返す中で、パラメータを外部に公開する方法や、vectorなどGLSL特有の概念を理解できるようになった。その後は、自ら仕様と要件を定義した上でAIコーディングを活用し、GLSLによるImage FilterおよびGeneratorを制作。再利用可能な形でストックしている。',
      result: 'TouchDesigner環境に適応したGLSL実装手法を確立した。基礎理解を前提に、仕様設計から生成までを行うワークフローを構築し、リアルタイム用途に対応可能なシェーダー群を蓄積している。'
    },
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
    process: {
      context: `アナログディレイのモデリングプラグインは既に多数存在している。

1つは、AmplitubeやGuitar Rigのようなギタリスト向けアンプシミュレータ内蔵型。シンプルだがモノラルで重く、エンジニア用途には不便な点が多い。

2つ目は、エンジニア向けの多機能型。パラメータが多く、即座に使うには複雑で、プリセットもピーキーなものが多い。

3つ目は、最低限の機能しか持たないインサート型で、アナログディレイらしさが薄い。

この状況の中で、知人が所有するStrymon TimelineやElectro-Harmonix Deluxe Memory Manを見て、ハードウェア特有の直感的な操作性とアナログディレイの質感を両立したプラグインがあれば差別化できるのではないかと考え、制作を開始した。また、JUCEとC++が必要なためこれまで着手できなかったが、AIの進化により自身のオーディオ知識を活かして実装できるのではないかという実験的側面もあった。`,
      approach: `JUCEとC++を用いて開発を開始。Phase構造によるモジュール分離を行い、配線（PluginProcessor）とDSPモジュール群を明確に分離した。

BBD段数解決、フィードバック経路、コンパンダ、トーン整形、ステレオ処理、レベルモード管理などを段階的にモジュール化し、内部は電圧ドメインで処理することで実際にアナログ回路の挙動を再現した。

オーバーサンプリング経路を実装し、SIMD最適化を適用。供給電圧や経年劣化、コンパンダ挙動などを組み込み、アナログ的挙動を再構成した。

UI面では、ハードウェア的な直感性を意識し、操作子を整理。ギタリストにもエンジニアにも扱えるバランスを目指した。

実装過程ではAIコーディングを活用しつつ、パラメータ設計や信号フロー、電圧スケールの整合性は自身で設計した。`,
      result: `アナログディレイの音楽的な質感と、現代的なステレオ処理・デジタルの利便性を両立したプラグインを構築した。
ギタリスト向けの直感性と、エンジニア用途に耐える拡張性を一つの設計に統合。

JUCE/C++によるオーディオプラグイン開発、AIを活用した実装ワークフロー、BBDモデリングと電圧ベース設計、Win/Macを横断するプラグインビルド、マルチプラットフォームの対応の難しさの知見を深める実験的プロジェクトとなった。` },
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
    process: {
      context: `OBS Studioには最終出力を統合的に監視するマスターバスが標準搭載されておらず、配信全体の音量バランスを正確に把握することが難しい状況があった。

YouTubeやTwitchの配信では、BGMが過大・ゲーム音が小さい・全体音量が基準に達していないなど、音量設計の弱さが散見された。自身がOBSを操作・指導する中でも、最終出力レベルが可視化されない点は明確な不満だった。

世界的にも同様の不満が共有されていることを確認し、制作を開始した。`,
      approach: `トラック1〜6を統合監視し、Peak / RMSに加え放送基準のLUFSをリアルタイム表示するプラグインを設計。

OBSのfront-end APIやQt6依存関係の理解から着手し、obsplugin-templateをベースに環境を構築。既存のOSSプラグインのソースを解析し、Dock化の仕組みや内部構造を学習・吸収した。

AIとの共同開発により仕様策定から実装までを高速化し、約2ヶ月でユニバーサルバイナリ化およびGitHub公開を実現した。`,
      result: `OBS内で配信全体の音量を一元管理できるマスターバスメーターを実装。

配信者が放送基準に基づいた客観的な音量管理を行える環境を提供し、実務的な課題解決とOSS公開までを完遂したプロジェクトとなった。また思わぬ副次的効果として、OBSのマスターバスの仕様理解が深まり、OBSがマスターバスにエフェクトをサポートしていないAPI上の仕様も知ることができた` },
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
    process: {
      context: `OBSの音声ルーティングは構造が複雑で、初学者がトラブルの原因を特定するのは容易ではない。また、熟練者であっても階層の深い設定を辿る必要があり、確認作業は非効率になりがちである。

特に、環境設定内のグローバル音声デバイスが意図せず影響していたり、大量のソースを含むシーンで「どのソースが実際に音を出しているのか」が把握しづらいという問題がある。

MasterLevelMeterの開発でOBSフロントAPIへの理解が進んだことを踏まえ、同様に音声トラブル解決に特化したプラグインの自主制作を行った。`,
      approach: `全音声デバイスとソースの状態をワンクリックで診断し、「現在音を出しているソース／インプットデバイス」を常時可視化する仕組みを設計。

OBS front-end APIを用いて内部状態を取得し、Qt6経由でJSON形式のマップとしてエクスポート可能にした。単なる機能実装にとどまらず、Qt6からJSONを書き出す構造やデータフローの理解を目的とした設計も行った。

既存のMasterLevelMeter開発時の知見やHowToを再利用し、AIの補助を受けながら約1ヶ月でプロトタイプを構築した。`,
      result: `OBSの複雑な音声フローを即座に可視化し、トラブルの原因特定を迅速化する診断ツールを実装。

JSONエクスポートにより状態共有が容易になり、他者サポートや業務用途における即応性を向上させた。

OBSプラグイン開発の再現性を高めつつ、内部構造理解と実装スピードの両立を達成したプロジェクトとなった。` },
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
    process: {
      context:
        `ライブ／ショー現場では、DAWを2台体制にする冗長構成が一般的だが、「マスターが停止してもバックアップが止まらない」Jam Sync環境を構築するには高価なハードウェアが必要だった。

      代表例としてMOTUのJamSync対応オーディオI/Oがあるが、1台10万円以上する機材を2台揃えるのは現実的な負担が大きい。

      ライブマニピュレーション業務の中で冗長性の重要性を体感していたことから、「ハードウェアに依存せず、ソフトウェアで代替できないか」という発想で本プロジェクトを開始した。

主要DAW（Logic / Cubase / Digital Performer / Pro Tools）を調査したところ、Jam Sync相当機能はほぼ未実装で、例外的にReaperのみが対応していた。
`,
      approach: `Mac標準のNetwork MIDIを活用し、
DAW（Master） → Network → Backup Mac → ButterSync → DAW
という構成を設計。

代替案としてLTC（libltc利用やネイティブ生成）も検討したが、計算コストや安定性の観点からMTC（MIDI Time Code）ベースに方針を決定した。

CoreMIDIとSwiftを用いて実装。
MTC仕様（Full Frame / Quarter Frame）、各DAWの送出仕様、受信時の挙動を実機検証しながら解析した。MIDI Monitorを用いて実際のメッセージ内容を確認し、挙動差を検証。

ロジックはシンプルで、
	- MTC受信時に内部クロックを生成して並走
	- 指定ミリ秒間MTCが途絶した場合、内部クロックへ即時フェイルオーバー

というフリーラン切替方式を採用した。

実装はAIコーディングを活用しつつ、仕様設計と検証は自身で主導した。`,
      result: `ソフトウェアのみでJam Sync的挙動を実現するプロトタイプを構築。

Digital Performer同士の構成では安定動作を確認し、インハウス用途で運用している。

一方で、LogicのMTC挙動が特殊で、ButterSync経由時にテンポ異常やロケーター移動が発生する問題があり、現時点では公開を見送っている。

本プロジェクトは、AIコーディングを本格的に導入する契機となった開発であり、CoreMIDI、MTC仕様理解、DAW間同期挙動の実証検証を通じて、ライブ現場の「止まれない」要件をソフトウェアで再解釈する試みとなった。` },
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
    process: {
      context: `Instagram投稿用の画像編集では、正方形トリミングやEXIF情報の文字入れが反復的かつ手動作業に依存している。

近年、EXIF情報をフレーム化してSNS投稿するスタイルがフォトグラファー間で広まっているが、多くはスマホアプリ前提のワークフローである。RAWや高画質JPGをスマホへ転送する工程に非効率さを感じ、Macネイティブで完結するツールの開発を着想した。

同時に、以下の技術的探究も目的とした。
- 4:3や16:9写真を最適にスクエアへフィットさせる方法
- Cocoa環境でのOpenCV / CoreImage / CoreGraphics連携
- Interface Builder習熟
- 画像フィルターの内部構造理解
- EXIFメタデータの保存構造の把握

映像制作で日常的に扱う技術の深部理解を目的とした、自主的な研究開発プロジェクトである。`,
      approach: `SwiftによるmacOSネイティブアプリとして実装。

OpenCVのサリエンシー解析を用いて写真の注目点を自動検出し、正方形フレーム内で中心配置。さらに背景の明度を解析し、EXIF文字色を自動調整するロジックを設計した。大量画像のバッチ処理にも対応している。

Vision Frameworkを使わなかった理由は、将来的なWindows移植可能性を見据え、OpenCVベースで構築する方針を選択したため。

開発ではOpenCVのmacOSビルドに大きく苦戦した。
	-	公式Framework配布が存在しない
	-	Homebrew版ではopencv_contrib（saliencyモジュール）が含まれない
	-	Framework形式ビルドが失敗
	-	最終的にCMakeによるdylibビルドへ移行
	-	Xcodeへラップして組み込み
	-	Developer ID署名対応
	-	Build PhasesのRun ScriptでFrameworksへ強制コピー

依存関係の解決とビルド環境構築そのものが重要な学習対象となった。`,
      result: `サリエンシー解析による自動中央配置とEXIF自動レイアウトを実装し、ほぼ要求を満たす実用アプリを完成。

一方で、
	-	フィルター適用後にサリエンシー判定が変化する設計上のバグ
	-	OpenCV由来のやや旧式なサリエンシーモデル
といった課題が残っているため、現状はインハウスツールとして運用している（修正予定）。

本プロジェクトは、macOSネイティブ開発、画像処理パイプライン設計、OpenCVビルド構造理解を深める実践的研究となった。

加えて、ライブラリ依存、ブリッジ、ビルド方式（Framework / dylib）、CMake、署名、Run Scriptによる配置制御など、これまでエンジニア間の会話で概念として耳にしていた技術要素を、非エンジニア出身の立場から初めて実践的に扱う機会となった。` },
    links: []
  }
};
