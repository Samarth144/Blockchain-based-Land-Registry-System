package com.aditya.bro.land.service;

import io.ipfs.api.IPFS;
import io.ipfs.api.MerkleNode;
import io.ipfs.api.NamedStreamable;
import io.ipfs.multihash.Multihash;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class IPFSService {

    private final IPFS ipfs;

    public IPFSService(@Value("${ipfs.api.url}") String ipfsApiUrl) {
        this.ipfs = new IPFS(ipfsApiUrl);
    }

    public String saveFile(MultipartFile file) throws IOException {
        NamedStreamable.InputStreamWrapper isw = new NamedStreamable.InputStreamWrapper(file.getInputStream());
        MerkleNode result = ipfs.add(isw).get(0);
        return result.hash.toString();
    }

    public byte[] getFile(String hash) throws IOException {
        Multihash multihash = Multihash.fromBase58(hash);
        return ipfs.cat(multihash);
    }
}