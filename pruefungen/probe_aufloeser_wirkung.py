#!/usr/bin/env python3
"""Wirkung des Aufloesers: jeder Upstream-Merge, der eine abgeleitete Datei aendert, ist
binnen FRIST von bestand-aufloesen nachgezogen -- ohne Job, ohne Hand.

WARUM ES DAS GIBT. Bis 2026-09-26 wurde UPSTREAM-DRIFT nur erkannt (rt-Task
qi-master-bestand-naht) und nie vom Traeger aufgeloest. Der Aufloeser (pruefungen/
bestand-aufloesen, rt-Task qi-master-bestand-aufloeser) soll das aendern. Diese Probe misst
die WIRKUNG, nicht den Lauf: fuer jedes EREIGNIS (ein Commit auf origin/main drueben, nach dem
die Ableitung ANDERE Bytes ergibt als davor) muss es hier einen Commit geben, dessen Nachricht
mit "bestand-aufloesen:" beginnt (nur das Werkzeug schreibt sie) und dessen BESTAND.json auf
einen Stand zeigt, der das Ereignis enthaelt -- und der binnen FRIST nach dem Ereignis liegt.

FRIST 26 h, nicht 24: der Aufloeser laeuft taeglich 06:05; ein Merge um 06:06 wird also erst
nach knapp 24 h gesehen, dazu ~7 min Build und rts Slot-Warten. 24 h waere am Rand rot, ohne
dass etwas kaputt ist.

EXIT 0 jedes reife Ereignis fristgerecht aufgeloest (mind. eines) | 1 ein Ereignis ist aelter
als FRIST und nicht vom Aufloeser nachgezogen (Marker "ROT:") | 4 KEINE AUSSAGE: seit dem
Stichtag gab es noch kein reifes Ereignis, oder git ist nicht lesbar.

  probe_aufloeser_wirkung.py [--kein-fetch]
Umlenkbar: QM_WIRKUNG_SEIT (ISO, Default Stichtag des Aufloesers), QM_WIRKUNG_FRIST_H.
"""
import datetime as dt
import json
import os
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bestand as B  # noqa: E402

SEIT = os.environ.get("QM_WIRKUNG_SEIT", "2026-09-26T02:05:00+00:00")
FRIST_H = float(os.environ.get("QM_WIRKUNG_FRIST_H", "26"))
MARKE = "bestand-aufloesen:"


def git(repo, *a):
    r = subprocess.run(["git", "-C", repo, *a], capture_output=True, text=True)
    if r.returncode != 0:
        raise B.Messausfall(f"git {' '.join(a[:3])}: {r.stderr.strip()[:200]}")
    return r.stdout


def zeit(s):
    return dt.datetime.fromisoformat(s.strip())


def main(argv):
    try:
        if "--kein-fetch" not in argv:
            git(B.QB_REPO, "fetch", "-q", "origin")
        quellen = sorted(set(B.K1) | {B.FAQ_QUELLE, *B.STUDIEN_QUELLEN})
        roh = git(B.QB_REPO, "log", "--first-parent", "--format=%H %cI", f"--since={SEIT}",
                  B.QB_REF, "--", *quellen).split("\n")
        kandidaten = [z.split() for z in roh if z.strip()]
        ereignisse = []
        for c, t in kandidaten:
            vorher = B.soll_ableiten(ref=f"{c}^")
            if B.soll_ableiten(ref=c) != vorher:
                ereignisse.append((c, zeit(t)))
        aufl = []
        for z in git(B.STOREFRONT, "log", "--format=%H %cI %s", f"--since={SEIT}").splitlines():
            h, t, s = z.split(" ", 2)
            if s.startswith(MARKE):
                mani = json.loads(git(B.STOREFRONT, "show", f"{h}:app/data/qi-master/BESTAND.json"))
                aufl.append((h, zeit(t), mani["upstream_commit"]))
    except (B.Messausfall, ValueError, KeyError) as e:
        print(f"EXIT4 MESSAUSFALL: {e}")
        return 4
    jetzt = dt.datetime.now(dt.timezone.utc)
    frist = dt.timedelta(hours=FRIST_H)
    ok, offen, rot = [], [], []
    for c, t in ereignisse:
        treffer = None
        for h, th, up in sorted(aufl, key=lambda x: x[1]):
            r = subprocess.run(["git", "-C", B.QB_REPO, "merge-base", "--is-ancestor", c, up])
            if r.returncode == 0:
                treffer = (h, th)
                break
        if treffer and treffer[1] - t <= frist:
            ok.append(f"{c[:9]} -> {treffer[0][:7]} nach {(treffer[1] - t).total_seconds() / 3600:.1f} h")
        elif jetzt - t <= frist and not treffer:
            offen.append(f"{c[:9]} (noch {(frist - (jetzt - t)).total_seconds() / 3600:.1f} h Frist)")
        else:
            wie = (f"erst {treffer[0][:7]} nach {(treffer[1] - t).total_seconds() / 3600:.1f} h" if treffer
                   else "nicht vom Aufloeser nachgezogen")
            rot.append(f"{c[:9]} vom {t:%Y-%m-%d %H:%MZ}: {wie}")
    print(f"Stichtag {SEIT}, Frist {FRIST_H:g} h: {len(kandidaten)} Upstream-Commits auf Quellen, "
          f"{len(ereignisse)} davon aendern die Ableitung; {len(aufl)} Aufloeser-Commits hier")
    for z in ok:
        print(f"  fristgerecht  {z}")
    for z in offen:
        print(f"  in Frist      {z}")
    if rot:
        print("ROT: " + " | ".join(rot))
        return 1
    if not ok:
        print("EXIT4 KEINE AUSSAGE: noch kein reifes Ereignis seit dem Stichtag -- die Wirkung ist "
              "unbeobachtet, nicht belegt")
        return 4
    print(f"GRUEN: {len(ok)} Ereignis(se) ohne Job fristgerecht nachgezogen")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
