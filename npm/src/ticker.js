'use strict';
export class WebAudioFontTicker {
    stateStop = 1;
    statePlay = 2;
    stateEnd = 3;
    state = this.stateStop;
    stepDuration = 0.1;
    lastPosition = 0;
    playLoop(player, audioContext, loopStart, loopPosition, loopEnd, queue) {
        this.startTicks(audioContext, function (when, from, to) {
            for (var i = 0; i < queue.length; i++) {
                var note = queue[i];
                if (note.when >= from && note.when < to) {
                    var start = when + note.when - from;
                    player.queueWaveTable(audioContext, note.destination, note.preset, start, note.pitch, note.duration, note.volume, note.slides);
                }
            }
        }, loopStart, loopPosition, loopEnd, function (at) {
            player.cancelQueue(audioContext);
        });
    }
    ;
    startTicks(audioContext, onTick, loopStart, loopPosition, loopEnd, onEnd) {
        if (this.state == this.stateStop) {
            this.state = this.statePlay;
            this.tick(audioContext, audioContext.currentTime, onTick, loopStart, loopPosition, loopEnd, onEnd);
        }
    }
    ;
    tick(audioContext, nextAudioTime, onTick, loopStart, loopPosition, loopEnd, onEnd) {
        this.lastPosition = loopPosition;
        if (this.state == this.stateEnd) {
            this.state = this.stateStop;
            onEnd(loopPosition);
        }
        else {
            if (this.state == this.statePlay) {
                if (nextAudioTime - this.stepDuration < audioContext.currentTime) {
                    if (loopPosition + this.stepDuration < loopEnd) {
                        var from = loopPosition;
                        var to = loopPosition + this.stepDuration;
                        onTick(nextAudioTime, from, to);
                        loopPosition = to;
                    }
                    else {
                        var from = loopPosition;
                        var to = loopEnd;
                        onTick(nextAudioTime, from, to);
                        from = loopStart;
                        to = loopStart + this.stepDuration - (loopEnd - loopPosition);
                        if (to < loopEnd) {
                            onTick(nextAudioTime + (loopEnd - loopPosition), from, to);
                            loopPosition = to;
                        }
                        else {
                            loopPosition = loopEnd;
                        }
                    }
                    nextAudioTime = nextAudioTime + this.stepDuration;
                    if (nextAudioTime < audioContext.currentTime) {
                        nextAudioTime = audioContext.currentTime;
                    }
                }
                var me = this;
                window.requestAnimationFrame(function (time) {
                    me.tick(audioContext, nextAudioTime, onTick, loopStart, loopPosition, loopEnd, onEnd);
                });
            }
        }
    }
    cancel() {
        if (this.state == this.statePlay) {
            this.state = this.stateEnd;
        }
    }
    ;
}
