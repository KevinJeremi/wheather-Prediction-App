import type React from "react"

const BoxLoader: React.FC = () => {
    return (
        <div className="relative w-24 h-24">
            <style>{`
        @keyframes box1 {
          0%, 50% {
            transform: translate(100%, 0);
          }
          100% {
            transform: translate(200%, 0);
          }
        }

        @keyframes box2 {
          0% {
            transform: translate(0, 100%);
          }
          50% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(100%, 0);
          }
        }

        @keyframes box3 {
          0%, 50% {
            transform: translate(100%, 100%);
          }
          100% {
            transform: translate(0, 100%);
          }
        }

        @keyframes box4 {
          0% {
            transform: translate(200%, 0);
          }
          50% {
            transform: translate(200%, 100%);
          }
          100% {
            transform: translate(100%, 100%);
          }
        }

        .boxes {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .box {
          position: absolute;
          width: 33.33%;
          height: 33.33%;
        }

        .box-1 {
          animation: box1 2s infinite;
          top: 0;
          left: 0;
        }

        .box-2 {
          animation: box2 2s infinite;
          top: 0;
          left: 33.33%;
        }

        .box-3 {
          animation: box3 2s infinite;
          top: 33.33%;
          left: 0;
        }

        .box-4 {
          animation: box4 2s infinite;
          top: 33.33%;
          left: 33.33%;
        }

        .face {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 2px solid;
          border-color: #2F80ED;
        }

        .face-front {
          background: rgba(47, 128, 237, 0.1);
          border-color: #2F80ED;
        }

        .face-right {
          background: rgba(47, 128, 237, 0.2);
          border-color: #56CCF2;
        }

        .face-top {
          background: rgba(86, 204, 242, 0.1);
          border-color: #56CCF2;
        }

        .face-back {
          background: rgba(47, 128, 237, 0.15);
          border-color: #BBE1FA;
        }
      `}</style>
            <div className="boxes">
                <div className="box box-1">
                    <div className="face face-front" />
                    <div className="face face-right" />
                    <div className="face face-top" />
                    <div className="face face-back" />
                </div>
                <div className="box box-2">
                    <div className="face face-front" />
                    <div className="face face-right" />
                    <div className="face face-top" />
                    <div className="face face-back" />
                </div>
                <div className="box box-3">
                    <div className="face face-front" />
                    <div className="face face-right" />
                    <div className="face face-top" />
                    <div className="face face-back" />
                </div>
                <div className="box box-4">
                    <div className="face face-front" />
                    <div className="face face-right" />
                    <div className="face face-top" />
                    <div className="face face-back" />
                </div>
            </div>
        </div>
    )
}

export default BoxLoader
