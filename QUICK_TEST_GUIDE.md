# 🎬 Quick Start: AI Video Interview

## Test the Interview Feature

### Prerequisites

1. ✅ Backend running on `http://localhost:8000`
2. ✅ Frontend running on `http://localhost:5173`
3. ✅ MongoDB connected
4. ✅ Camera and microphone connected

---

## Step-by-Step Test

### 1. Prepare Interview Questions

```
1. Go to http://localhost:5173
2. Login or Sign up
3. Navigate to "Upload Resume"
4. Drag & drop your PDF/DOC resume
5. Click "Generate Interview Questions"
6. Wait for AI to generate questions
7. Click "Start Interview"
```

### 2. During Interview

```
✅ Browser will ask for camera/mic permission → ALLOW
✅ Camera preview appears (mirrored)
✅ First question loads
✅ AI speaks the question out loud (TTS)
✅ Recording starts automatically after TTS
✅ You see:
   - Video preview with your face
   - Question text on screen
   - "REC" indicator (top-right)
   - Timer counting up

✅ Answer the question while recording
✅ Click "Next Question →" when done
✅ Video uploads to backend
✅ Next question loads automatically
✅ Repeat until all questions answered
```

### 3. Completion

```
✅ "Interview Completed!" screen appears
✅ Auto-redirect to Dashboard after 2 seconds
✅ Interview saved in backend
```

---

## 🎯 Key Features to Test

### Camera Permissions

- [ ] Allow permission → Interview starts
- [ ] Deny permission → Error message + retry option
- [ ] No camera found → Appropriate error

### Video Recording

- [ ] Video preview shows your face (mirrored)
- [ ] Red border appears when recording
- [ ] Timer counts up accurately
- [ ] Recording indicator visible (top-right)

### Question Flow

- [ ] Questions load automatically
- [ ] AI speaks question via TTS
- [ ] Text appears on screen
- [ ] "AI is speaking..." animation shows
- [ ] Progress bar animates during TTS

### Navigation

- [ ] Can't go back during recording (disabled)
- [ ] "Next Question" button works
- [ ] Upload happens automatically
- [ ] Next question loads smoothly
- [ ] Completion redirects to dashboard

### Animations

- [ ] Smooth page transitions
- [ ] Pulsing recording dot
- [ ] AI speaking dots animation
- [ ] Question card fade in/out
- [ ] Red border pulse during recording

---

## 🐛 Common Issues & Fixes

### Issue: "Camera access denied"

**Fix**:

1. Click address bar
2. Click camera icon
3. Select "Always allow"
4. Refresh page

### Issue: "No questions found"

**Fix**:

1. Go back to Dashboard
2. Upload resume again
3. Wait for questions to generate
4. Try starting interview again

### Issue: TTS not working

**Fix**:

- Check browser volume
- Check system volume
- Question still appears on screen
- Recording still works

### Issue: Upload failing

**Fix**:

- Check backend is running
- Check network connection
- Check backend logs for errors

---

## 📊 What Gets Recorded

Each answer includes:

- **Video**: WebM format (VP9 codec)
- **Audio**: Opus codec (44.1kHz)
- **Metadata**:
  - Question ID
  - Question number
  - Recording duration
  - Interview session ID

---

## 🎨 Visual Guide

### Normal State

```
┌─────────────────────────┐
│   [Video Preview]       │
│   (Your face mirrored)  │
└─────────────────────────┘

┌─────────────────────────┐
│ Question 1 of 5         │
│                         │
│ 🤖 "Tell me about..."   │
└─────────────────────────┘

[Loading...] or [Next Question →]
```

### Recording State

```
┌──────────────────────── REC ──┐  ← Top right
│ ● 00:45 RECORDING            │
└───────────────────────────────┘

┌─────────────────────────┐
│┏━━━━━━━━━━━━━━━━━━━━━┓ │ ← Red border
│┃ [Video Preview]      ┃ │
│┃ (Your face)          ┃ │
│┃                      ┃ │
│┃  [● REC]            ┃ │ ← REC badge
│┗━━━━━━━━━━━━━━━━━━━━━┛ │
└─────────────────────────┘

[Next Question →]
```

---

## 💡 Pro Tips

1. **Good Lighting**: Face a window or light source
2. **Quiet Environment**: Reduce background noise
3. **Look at Camera**: Not at the screen
4. **Speak Clearly**: Enunciate your answers
5. **Take Your Time**: No rush between questions
6. **Stable Connection**: Ensure good internet for uploads

---

## 🎉 Success Indicators

You'll know it's working when:

- ✅ You see yourself in the video preview
- ✅ Red "REC" indicator appears
- ✅ Timer counts up
- ✅ Questions change automatically
- ✅ Toast notifications appear
- ✅ Completion screen shows at the end

---

## 📞 Need Help?

Check:

1. Browser console (F12) for errors
2. Backend terminal for API errors
3. Network tab for failed requests
4. INTERVIEW_FEATURE.md for detailed docs

---

**Ready? Start your interview! 🎬🚀**
